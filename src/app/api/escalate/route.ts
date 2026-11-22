import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'support_tickets.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ tickets: [] });
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const tickets = JSON.parse(content);
    return NextResponse.json({ tickets });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to read tickets', details: error?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentName, studentId, department, issueSummary, chatTranscript, notes } = body;

    const filePath = path.join(process.cwd(), 'data', 'support_tickets.json');
    let tickets = [];
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        tickets = JSON.parse(fileContent);
      } catch (e) {
        tickets = [];
      }
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `TKT-${randomNum}`;

    const newTicket = {
      ticketId,
      timestamp: new Date().toISOString(),
      studentName: studentName || 'Alex Rivera',
      studentId: studentId || '#20268841',
      department: department || 'Student Affairs & Support Desk',
      issueSummary: issueSummary || 'General Support Escalation',
      chatTranscript: chatTranscript || '',
      notes: notes || '',
      status: 'Open',
      staffResponse: null,
      respondedAt: null,
      respondedBy: null
    };

    tickets.unshift(newTicket);
    fs.writeFileSync(filePath, JSON.stringify(tickets, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      ticket: newTicket,
      message: 'Support escalation ticket created successfully.'
    });
  } catch (error: any) {
    console.error('Escalation API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create escalation ticket', details: error?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { ticketId, staffResponse, staffName, status } = body;

    if (!ticketId || !staffResponse) {
      return NextResponse.json({ error: 'Ticket ID and staff response are required.' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'data', 'support_tickets.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Tickets file not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const tickets = JSON.parse(fileContent);

    const ticketIndex = tickets.findIndex((t: any) => t.ticketId === ticketId);
    if (ticketIndex === -1) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    tickets[ticketIndex] = {
      ...tickets[ticketIndex],
      status: status || 'Resolved',
      staffResponse,
      respondedBy: staffName || 'Dr. Eleanor Vance (Dean of Student Affairs)',
      respondedAt: new Date().toISOString()
    };

    fs.writeFileSync(filePath, JSON.stringify(tickets, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      ticket: tickets[ticketIndex],
      message: 'Staff response submitted successfully and synced.'
    });
  } catch (error: any) {
    console.error('Update ticket error:', error);
    return NextResponse.json({ error: 'Failed to update ticket', details: error?.message }, { status: 500 });
  }
}
