import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Load grounding documents
function getUniversityDocuments() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'universityDocs.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading universityDocs.json:', err);
  }
  return [];
}

// Score and filter only the most relevant document sections (Mini-RAG / Selective Filtering)
function getRelevantContext(query: string, docs: any[]): { context: string; matchedDocTitle?: string; isOffTopicExternal?: boolean } {
  const q = query.toLowerCase();

  // Detect questions inquiring about external universities, colleges, or unrelated institutions
  const externalKeywords = [
    'harvard', 'mit', 'stanford', 'oxford', 'cambridge', 'yale', 'princeton', 'columbia',
    'cornell', 'berkeley', 'ucla', 'nyu', 'different university', 'another university',
    'other university', 'other uni', 'different uni', 'another college', 'other college'
  ];
  const isOffTopicExternal = externalKeywords.some(keyword => q.includes(keyword));

  // Keyword mapping to document categories and titles
  const scoredDocs = docs.map((doc: any) => {
    let score = 0;
    const title = doc.title.toLowerCase();
    const category = doc.category.toLowerCase();
    const summary = doc.summary.toLowerCase();

    // Check title/category matches
    if (q.split(/\s+/).some((word: string) => word.length > 3 && title.includes(word))) score += 5;
    if (q.includes(category)) score += 4;
    if (q.split(/\s+/).some((word: string) => word.length > 3 && summary.includes(word))) score += 2;

    // Contact queries boost sections containing contact details
    const isContactQuery = q.includes('phone') || q.includes('call') || q.includes('number') || q.includes('contact') || q.includes('email') || q.includes('reach');

    // Check section contents
    doc.sections.forEach((sec: any) => {
      const heading = sec.heading.toLowerCase();
      if (isContactQuery && heading.includes('contact')) {
        score += 8;
      }
      if (q.split(/\s+/).some((word: string) => word.length > 3 && heading.includes(word))) score += 3;
      sec.lines.forEach((line: string) => {
        const l = line.toLowerCase();
        if (q.split(/\s+/).some((word: string) => word.length > 3 && l.includes(word))) score += 1;
      });
    });

    return { doc, score };
  });

  // Sort descending by relevance score
  scoredDocs.sort((a: any, b: any) => b.score - a.score);

  // If top match has a meaningful score (> 2), send the top relevant documents (~400-800 tokens)
  const topMatches = scoredDocs.filter((item: any) => item.score > 2).slice(0, 3);

  if (topMatches.length > 0) {
    let context = 'RELEVANT OFFICIAL HORIZON UNIVERSITY POLICY DOCUMENTS (FILTERED):\n\n';
    topMatches.forEach((item: any) => {
      const d = item.doc;
      context += `DOCUMENT: ${d.title} (${d.filename})\n`;
      context += `Department: ${d.department} | Version: ${d.lastUpdated}\n`;
      context += `Summary: ${d.summary}\n`;
      d.sections.forEach((sec: any) => {
        context += `[Section: ${sec.heading}]\n`;
        sec.lines.forEach((l: string) => {
          context += `- ${l}\n`;
        });
      });
      context += '\n--------------------------------------------------\n\n';
    });
    return { context, matchedDocTitle: topMatches[0].doc.title, isOffTopicExternal };
  }

  // Fallback: If no specific match, send full summary index (compact)
  let context = 'HORIZON UNIVERSITY POLICY SUMMARY INDEX:\n\n';
  docs.forEach((doc: any) => {
    context += `• ${doc.title} (${doc.filename}) - ${doc.summary}\n`;
  });
  return { context, isOffTopicExternal };
}

// Build optimized system instruction grounding prompt
function buildSystemInstruction(query: string, docs: any[]) {
  const { context, isOffTopicExternal } = getRelevantContext(query, docs);

  return `You are the Horizon University AI Support Desk Assistant.
Your sole purpose is to assist students with authoritative, clear, and exact information regarding Horizon University policies, academic calendar deadlines, financial aid rules, IT credentials, library policies, health services, and student housing.

MANDATORY BEHAVIOR & GROUNDING RULES:
1. STRICT HORIZON SCOPE ONLY:
   - You ONLY represent Horizon University.
   - If the user asks about ANY other university, college, or external institution (such as Harvard, MIT, Stanford, NYU, Oxford, or another university's software/services/policies):
     YOU MUST REFUSE TO ANSWER ABOUT THAT OTHER INSTITUTION.
     Respond with:
     "I am the Horizon University Assistant and can only answer questions regarding Horizon University policies and campus services. I cannot provide information regarding other institutions. If you need assistance with external transfer credits or partnerships, please click **Talk to a Human** to contact our admissions and transfer office."
     Do NOT list Horizon University services as if they apply to another school.

2. CONTACT INFORMATION & PHONE NUMBERS:
   - If the user asks for a contact number, phone number, email address, or office location, AND that information exists in the provided Horizon University policy documents below (e.g. Registrar, IT Support, Health Center, Parking, Housing, Conduct, Career Services, Bursar):
     YOU MUST PROVIDE THE EXACT PHONE NUMBER AND DETAILS DIRECTLY and cite the document filename.
     Do NOT tell them to **Talk to a Human** when the phone number or contact information is clearly written in the document!

3. FACTUAL CITATION REQUIREMENT:
   - For every answer you provide regarding Horizon policies, you MUST cite the exact PDF filename and document title (e.g. "Source: Academic Calendar and Exam Regulations (01_Academic_Calendar_and_Exam_Regulations.pdf)").
   - Be exact with dollar amounts, deadlines, room numbers, and phone numbers.

4. MISSING INFO / ESCALATION RULE:
   - If a student's question is about Horizon University but the specific answer is genuinely NOT covered anywhere in the provided documents, or involves a personal grade appeal, roommate dispute, or fee waiver dispute:
     Clearly inform them that this specific policy is not detailed in the published handbooks and instruct them to click **Talk to a Human** to log an official escalation ticket.

${context}`;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required.' }, { status: 400 });
    }

    const docs = getUniversityDocuments();
    const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop()?.content || '';
    const systemPrompt = buildSystemInstruction(lastUserMsg, docs);

    const apiKey = process.env.GEMINI_API_KEY;

    // If API key is not configured or is placeholder, provide a high-quality grounded fallback engine
    if (!apiKey || apiKey === 'your_free_google_ai_studio_key' || apiKey.trim() === '') {
      const fallbackReply = generateRuleBasedResponse(lastUserMsg, docs);
      return NextResponse.json({ reply: fallbackReply });
    }

    // Official @google/genai SDK integration
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      // Transform conversation history for Gemini API
      const formattedContents = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: formattedContents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2,
        },
      });

      const replyText = response.text || 'I apologize, but I could not formulate a response at this time.';
      return NextResponse.json({ reply: replyText });
    } catch (sdkError: any) {
      console.warn('Google GenAI SDK call returned an issue, using intelligent grounded fallback:', sdkError?.message);
      const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop()?.content || '';
      const fallbackReply = generateRuleBasedResponse(lastUserMsg, docs);
      return NextResponse.json({ reply: fallbackReply });
    }
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message', details: error?.message },
      { status: 500 }
    );
  }
}

// Fallback search engine that strictly uses data/universityDocs.json when offline or missing key
function generateRuleBasedResponse(query: string, docs: any[]): string {
  const q = query.toLowerCase();

  // 1. External institutions check
  const externalKeywords = [
    'harvard', 'mit', 'stanford', 'oxford', 'cambridge', 'yale', 'princeton', 'columbia',
    'cornell', 'berkeley', 'ucla', 'nyu', 'different university', 'another university',
    'other university', 'other uni', 'different uni', 'another college', 'other college'
  ];
  if (externalKeywords.some(keyword => q.includes(keyword))) {
    return `I am the Horizon University Assistant and can only answer questions regarding Horizon University policies, academic regulations, and campus services. I cannot provide information regarding other institutions.

If you need assistance regarding transfer credits, admissions equivalencies, or cross-institutional partnerships, please click **Talk to a Human** above to submit an escalation ticket to our Admissions and Registrar staff.`;
  }

  // 2. Explicit check for personal disputes, requests for room change, or manual action requests
  if (
    q.includes('change') && (q.includes('roommate') || q.includes('dorm') || q.includes('room')) ||
    q.includes('appeal') || q.includes('dispute') || q.includes('refund my') || q.includes('waive my fee') ||
    q.includes('excuse me') || q.includes('change my grade') || q.includes('human')
  ) {
    return `I reviewed the official Horizon University policy documentation, but this inquiry involves a personal account review, room reassignment dispute, or requires formal departmental approval.

Please click **Talk to a Human** in the chat header to open an official escalation ticket. Your student ID (#20268841) and conversation details will be immediately forwarded to Residential Life and Student Affairs staff.`;
  }

  // 3. Contact information / phone numbers inquiry
  if (q.includes('phone') || q.includes('call') || q.includes('number') || q.includes('contact') || q.includes('reach')) {
    if (q.includes('registrar') || q.includes('exam') || q.includes('transcript') || q.includes('grade')) {
      return `Here is the contact information for the Registrar Office:
• **Phone:** (555) 019-2831
• **Email:** registrar@horizon.edu
• **Location:** Hall of Administration, Room 114
• **Walk-in Hours:** Monday-Friday 9:00 AM - 4:30 PM EST

*Source: Academic Calendar and Exam Regulations (\`01_Academic_Calendar_and_Exam_Regulations.pdf\`)*`;
    }

    if (q.includes('it') || q.includes('tech') || q.includes('wifi') || q.includes('password') || q.includes('computer')) {
      return `Here is the contact information for IT Support:
• **Phone:** (555) 019-4357 (HELP)
• **Email:** itsupport@horizon.edu
• **Location:** Tech Commons Ground Floor, Room 045
• **Hours:** Monday-Thursday 8:00 AM - 8:00 PM, Friday 8:00 AM - 5:00 PM EST

*Source: IT Services, WiFi, and Software Licensing (\`04_IT_Services_WiFi_and_Software_Licensing.pdf\`)*`;
    }

    if (q.includes('health') || q.includes('clinic') || q.includes('doctor') || q.includes('nurse') || q.includes('counsel')) {
      return `Here is the contact information for Campus Health & Counseling:
• **Appointments / Clinic Phone:** (555) 019-9355 | Email: healthcenter@horizon.edu
• **24/7 Nurse Triage Line:** (555) 019-WELL
• **Counseling Services (CAPS):** (555) 019-9356 | Email: caps@horizon.edu
• **Crisis Lifeline:** Dial 988 or text 'HORIZON' to 741741

*Source: Campus Health, Wellness, and Counseling Services (\`07_Campus_Health_Wellness_and_Counseling_Services.pdf\`)*`;
    }

    if (q.includes('parking') || q.includes('shuttle') || q.includes('car') || q.includes('permit') || q.includes('lockout')) {
      return `Here is the contact information for Parking & Transportation:
• **Phone:** (555) 019-7275 (PARK)
• **Dispatch & Lockout Help:** (555) 019-7276
• **Email:** parking@horizon.edu
• **Location:** North Campus Garage, Suite 100

*Source: Campus Parking, Shuttle, and Transport Rules (\`09_Campus_Parking_Shuttle_and_Transport_Rules.pdf\`)*`;
    }

    if (q.includes('housing') || q.includes('residence') || q.includes('dorm')) {
      return `Here is the contact information for Residential Life:
• **Office Phone:** (555) 019-3300
• **24/7 On-Call RA Dispatch:** (555) 019-3399
• **Email:** reslife@horizon.edu
• **Location:** Horizon Village Center, Room B12

*Source: Campus Housing and Residence Handbook (\`03_Campus_Housing_and_Residence_Handbook.pdf\`)*`;
    }

    if (q.includes('bursar') || q.includes('tuition') || q.includes('finance') || q.includes('aid')) {
      return `Here is the contact information for Tuition & Financial Aid:
• **Bursar Office Phone:** (555) 019-4420 | Email: bursar@horizon.edu
• **Financial Aid Helpdesk:** (555) 019-4421 | Email: finaid@horizon.edu
• **Location:** Financial Services Tower, Suite 210

*Source: Tuition Refunds and Financial Aid Policy (\`02_Tuition_Refunds_and_Financial_Aid_Policy.pdf\`)*`;
    }

    if (q.includes('career') || q.includes('job') || q.includes('internship') || q.includes('handshake')) {
      return `Here is the contact information for Career Services:
• **Phone:** (555) 019-8200
• **Email:** career@horizon.edu (Handshake Support: handshake-help@horizon.edu)
• **Location:** Success Hall, 2nd Floor

*Source: Career Services, Internships, and Co-Op Guide (\`08_Career_Services_Internships_and_CoOp_Guide.pdf\`)*`;
    }

    if (q.includes('library') || q.includes('book')) {
      return `Here is the contact information for Founders Library:
• **Phone:** (555) 019-2100
• **Email:** library@horizon.edu
• **Chat Desk:** library.horizon.edu/chat (Mon-Fri 10:00 AM - 6:00 PM)
• **Location:** Founders Library Building Front Desk

*Source: Library and Research Facilities Policy (\`05_Library_and_Research_Facilities_Policy.pdf\`)*`;
    }

    // General directory summary if no specific department was named
    return `Here are the official contact numbers for key Horizon University offices:
• **Registrar Office:** (555) 019-2831 | registrar@horizon.edu
• **IT Support Center:** (555) 019-4357 | itsupport@horizon.edu
• **Campus Health & 24/7 Triage:** (555) 019-9355 / (555) 019-WELL
• **Parking & Shuttles:** (555) 019-7275 | parking@horizon.edu
• **Residential Life:** (555) 019-3300 | reslife@horizon.edu
• **Bursar & Tuition:** (555) 019-4420 | bursar@horizon.edu

*Source: Horizon University Directory and Campus Policy Handbooks*`;
  }

  // Refund / Tuition
  if (q.includes('refund') || q.includes('tuition') || q.includes('bursar') || q.includes('scholarship')) {
    return `According to official Horizon University policy, here are the tuition and refund rules:

• **Withdrawal Weeks 1-2 (before Sep 11, 2026):** **100% tuition refund** (minus a $100 processing fee).
• **Withdrawal Week 3 (Sep 12 - Sep 18, 2026):** **75% tuition refund**.
• **Withdrawal Week 4 (Sep 19 - Sep 25, 2026):** **50% tuition refund**.
• **Withdrawal after Week 4 (Sep 26 onward):** **0% refund**. Lab and technology fees are strictly non-refundable.
• **Late Payment Fee:** $125 assessed on accounts after August 18, 2026.
• **Merit Scholarships:** Presidential Merit Scholarship ($12,000/yr) requires a cumulative GPA of **3.50+** and 30 credits/year.

*Source: Tuition Refunds and Financial Aid Policy (\`02_Tuition_Refunds_and_Financial_Aid_Policy.pdf\`)*
Contact: Bursar Office at bursar@horizon.edu | Phone: (555) 019-4420.`;
  }

  // Parking / Transport / Shuttle
  if (q.includes('parking') || q.includes('permit') || q.includes('shuttle') || q.includes('car') || q.includes('ev')) {
    return `Here are the official campus transportation and parking regulations:

• **Commuter Student Permit (Lots C1-C6):** **$220 per academic year** ($125 per single semester).
• **Resident Student Permit (Lots R1-R4):** **$340 per academic year** (restricted to assigned dorm perimeter).
• **Evening Only Permit:** $85 per semester (valid after 4:30 PM and weekends).
• **Free Campus Shuttles:** Blue Line runs every 10 minutes (7:00 AM - 11:00 PM, Mon-Fri); Gold Line runs every 20 minutes (7:00 AM - 1:00 AM daily) with your Horizon Student ID tap.
• **EV Charging:** 24 Level-2 stations at $0.14/kWh for the first 3 hours ($5.00/hr idle fee applies once fully charged).
• **Fines:** Parking without permit is $45; unauthorized ADA handicap stall parking is $250.

*Source: Campus Parking, Shuttle, and Transport Rules (\`09_Campus_Parking_Shuttle_and_Transport_Rules.pdf\`)*
Contact: Parking Services at parking@horizon.edu | Phone: (555) 019-7275.`;
  }

  // Health / Counseling / Therapy
  if (q.includes('counsel') || q.includes('therapy') || q.includes('mental health') || q.includes('health') || q.includes('doctor') || q.includes('clinic')) {
    return `Horizon University provides comprehensive medical and psychological support:

• **Free Counseling Sessions:** Enrolled students receive up to **10 free individual counseling sessions** per academic year through CAPS.
• **Group Therapy:** Unlimited access to anxiety, stress management, and mindfulness workshops.
• **Primary Care Medical Clinic:** Level 1 Wellness Center open Mon-Fri 8:30 AM - 5:00 PM ($0 co-pay for full-time students for basic physician consultations).
• **24/7 Nurse Triage:** Available at (555) 019-WELL.
• **Crisis Lifeline:** Dial 988 or text 'HORIZON' to 741741.

*Source: Campus Health, Wellness, and Counseling Services (\`07_Campus_Health_Wellness_and_Counseling_Services.pdf\`)*
Contact: Appointments at healthcenter@horizon.edu | Phone: (555) 019-9355.`;
  }

  // Library / Fines / Study Rooms
  if (q.includes('library') || q.includes('fine') || q.includes('book') || q.includes('study room')) {
    return `Here are the official library lending and facility policies:

• **Borrowing Limit:** Undergraduate students can borrow up to **25 physical books** for a 28-day loan cycle.
• **Overdue Fines:** Standard books are **$0.50 per day** (maximum cap $25.00/item). Course reserves are $2.00 per hour overdue fee.
• **One-Time Fine Waiver:** Allowed **once per academic year** for first-time minor infractions (under $10.00) via Front Desk appeal.
• **24/7 Study Rooms (Rooms 201-224):** Reserve online at library.horizon.edu/rooms up to 7 days in advance (max 3 hours/day).
• **Silent Zone:** Level 4 is a permanent silent study floor (cell calls prohibited).

*Source: Library and Research Facilities Policy (\`05_Library_and_Research_Facilities_Policy.pdf\`)*
Contact: Founders Library Front Desk | library@horizon.edu | Phone: (555) 019-2100.`;
  }

  // Academic Calendar / Add-Drop / Exams
  if (q.includes('add') || q.includes('drop') || q.includes('exam') || q.includes('deadline') || q.includes('gpa') || q.includes('grading')) {
    return `Here are key academic calendar dates and exam regulations:

• **Add/Drop Period:** August 28 - September 11, 2026 (100% tuition adjustment, no transcript notation).
• **Course Withdrawal Deadline ('W' mark):** October 23, 2026.
• **Final Exams Week:** December 14 - December 21, 2026.
• **Grading Scale:** A (4.00), A- (3.70), B+ (3.30), B (3.00), B- (2.70), C+ (2.30), C (2.00), C- (1.70), D (1.00), F (0.00).
• **Exam Deferral for Illness:** Must submit **Form MED-9** within 48 hours of missed exam signed by a licensed practitioner.
• **Dean's List:** Requires term GPA >= 3.75 with minimum 15 graded credits.

*Source: Academic Calendar and Exam Regulations (\`01_Academic_Calendar_and_Exam_Regulations.pdf\`)*
Contact: Registrar Office, Hall of Administration Room 114 | registrar@horizon.edu | Phone: (555) 019-2831.`;
  }

  // IT / WiFi / Software
  if (q.includes('wifi') || q.includes('eduroam') || q.includes('software') || q.includes('vpn') || q.includes('license') || q.includes('password')) {
    return `Horizon University IT Services guidelines:

• **Eduroam WiFi:** SSID 'eduroam', username format \`studentID@horizon.edu\` with your Portal password.
• **Free Software:** Microsoft 365 Apps for Enterprise (install on up to 5 devices), JetBrains All Products educational license, MATLAB Campus Suite, and GitHub Student Developer Pack.
• **Campus VPN:** GlobalProtect endpoint at \`vpn.horizon.edu\` with Duo Security MFA.
• **Password Reset:** Self-service at \`identity.horizon.edu\` (passwords expire every 180 days).

*Source: IT Services, WiFi, and Software Licensing (\`04_IT_Services_WiFi_and_Software_Licensing.pdf\`)*
Contact: IT Support Center, Tech Commons Room 045 | itsupport@horizon.edu | Phone: (555) 019-4357.`;
  }

  // Housing / Dorms
  if (q.includes('housing') || q.includes('dorm') || q.includes('guest') || q.includes('quiet hour') || q.includes('residence')) {
    return `Residence Hall Living Policies:

• **Quiet Hours:** Sunday-Thursday 10:00 PM - 8:00 AM; Friday-Saturday 12:00 Midnight - 9:00 AM (24-hour quiet period during final exam week).
• **Overnight Guests:** Must register at front desk; max 3 consecutive nights or 6 nights/month with prior roommate portal consent.
• **Maintenance Emergency:** Dispatched within 2 hours (24/7 hotline: 555-019-3399).
• **Move-out Fees:** Uncleaned room $150, lost key $65, drywall repair $85.

*Source: Campus Housing and Residence Handbook (\`03_Campus_Housing_and_Residence_Handbook.pdf\`)*
Contact: Residential Life Office, Village Center Room B12 | reslife@horizon.edu | Phone: (555) 019-3300.`;
  }

  // Academic Integrity / AI Policy
  if (q.includes('ai') || q.includes('integrity') || q.includes('plagiarism') || q.includes('cheating')) {
    return `Academic Integrity & AI Tool Usage Code:

• **Category Green (Permitted):** AI for grammar checking, brainstorming, and literature discovery when properly cited.
• **Category Yellow (Conditional):** AI code assistance permitted only when explicitly designated in the course syllabus.
• **Category Red (Prohibited):** Submitting unedited AI prose or code as your own work.
• **Mandatory Requirement:** All AI assistance must be disclosed in an 'AI Acknowledgement Statement' with the assignment.
• **Sanction Tiers:** Level 1 (zero on assignment + Ethics Workshop), Level 2 ('XF' transcript grade for the course), Level 3 (suspension/expulsion).

*Source: Student Conduct and Academic Integrity Code (\`06_Student_Conduct_and_Academic_Integrity_Code.pdf\`)*
Contact: Office of Student Conduct, Union Hall Room 308 | conduct@horizon.edu | Phone: (555) 019-5500.`;
  }

  // General fallback instructing human review
  return `I reviewed the official Horizon University policy documentation, but your inquiry may involve a personal account review, specific departmental authorization, or is not explicitly covered in the published policy handbooks.

Please click **Talk to a Human** in the chat header or below to open an official escalation ticket with our Student Affairs staff. We will forward your student ID (#20268841) and conversation transcript directly to the designated department.`;
}
