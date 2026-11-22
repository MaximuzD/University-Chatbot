# Horizon University Student & Staff Portal with AI Support Desk

An agentic university portal built with **Next.js 15 (App Router)**, **Tailwind CSS**, and **Google Gemini API** (`@google/genai`). Features a grounded **Mini-RAG** policy engine, interactive PDF viewer, and an integrated staff escalation ticket system.

---

## 🚀 Key Features

- **🎓 Student Portal**:
  - Academic dashboard with real-time course grades, schedules, and GPA calculation.
  - Financial aid overview with prorated tuition refund schedules.
  - Interactive PDF modal viewer for 10 official campus policy handbooks.
  - Dedicated **AI Support Desk** with Mini-RAG keyword filtering and live Google Gemini API grounding.
  - Direct "Talk to a Human" escalation workflow with automatic transcript logging.
  - Dark / Light mode toggle.

- **🛡️ Staff & Faculty Desk (`/staff`)**:
  - Secure credential-based access (`staff` / `horizon2026`).
  - Master-detail queue of student escalation tickets (`data/support_tickets.json`).
  - Detailed student issue statements and pre-escalation AI chat transcripts.
  - One-click response publisher that syncs immediately back to the student's dashboard.

- **🤖 Mini-RAG & Policy Grounding**:
  - Grounded exclusively in 10 university policy handbooks covering Academics, Bursar, Housing, IT, Library, Health & Counseling, and Parking.
  - Refuses queries regarding external universities (e.g. MIT, Harvard) to eliminate cross-institution hallucinations.
  - Automatically parses citation references into interactive PDF buttons.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS & Astryx Design System tokens
- **Icons**: Lucide React
- **AI / LLM**: `@google/genai` (SDK model `gemini-flash-latest`)
- **Storage**: Local JSON stores (`data/universityDocs.json`, `data/support_tickets.json`)

---

## 📦 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/MaximuzD/University-Chatbot.git
cd University-Chatbot
npm install
```

### 2. Configure Environment Variables
Copy `.env.local.example` to `.env.local` and add your Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the Student Portal or [http://localhost:3000/staff](http://localhost:3000/staff) for the Staff Management Desk.
