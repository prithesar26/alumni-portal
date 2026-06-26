import { NextResponse } from 'next/server';
import { dbQuery, dbRun, initDb, mockDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const connection = await initDb();
    const requestIdInt = parseInt(id, 10);

    // Verify session user is part of this mentorship connection
    let connectionVerified = false;
    if (connection === 'MOCK') {
      const req = mockDb.mentorship_requests.find(r => r.id === requestIdInt);
      if (req && (req.student_id === session.id || req.alumni_id === session.id)) {
        connectionVerified = true;
      }
    } else {
      const req = await dbQuery(
        'SELECT student_id, alumni_id FROM mentorship_requests WHERE id = ?',
        [requestIdInt]
      );
      if (req.length > 0 && (req[0].student_id === session.id || req[0].alumni_id === session.id)) {
        connectionVerified = true;
      }
    }

    if (!connectionVerified) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let chats = [];
    if (connection === 'MOCK') {
      chats = mockDb.mentorship_chats
        .filter(c => c.request_id === requestIdInt)
        .map(c => {
          const user = mockDb.users.find(u => u.id === c.sender_id);
          return {
            ...c,
            sender_name: user ? user.name : 'Unknown',
            sender_role: user ? user.role : 'student'
          };
        })
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else {
      chats = await dbQuery(
        `SELECT mc.*, u.name as sender_name, u.role as sender_role 
         FROM mentorship_chats mc 
         JOIN users u ON mc.sender_id = u.id 
         WHERE mc.request_id = ? 
         ORDER BY mc.created_at ASC`,
        [requestIdInt]
      );
    }

    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Fetch Chats API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching chat history' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const connection = await initDb();
    const requestIdInt = parseInt(id, 10);

    // Verify connection membership
    let connectionVerified = false;
    if (connection === 'MOCK') {
      const req = mockDb.mentorship_requests.find(r => r.id === requestIdInt);
      if (req && (req.student_id === session.id || req.alumni_id === session.id)) {
        connectionVerified = true;
      }
    } else {
      const req = await dbQuery(
        'SELECT student_id, alumni_id FROM mentorship_requests WHERE id = ?',
        [requestIdInt]
      );
      if (req.length > 0 && (req[0].student_id === session.id || req[0].alumni_id === session.id)) {
        connectionVerified = true;
      }
    }

    if (!connectionVerified) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (connection === 'MOCK') {
      const newChat = {
        id: mockDb.mentorship_chats.length + 1,
        request_id: requestIdInt,
        sender_id: session.id,
        message: message.trim(),
        created_at: new Date().toISOString()
      };
      mockDb.mentorship_chats.push(newChat);
      const user = mockDb.users.find(u => u.id === session.id);
      
      return NextResponse.json({
        message: 'Message sent successfully',
        chat: {
          ...newChat,
          sender_name: user ? user.name : session.name,
          sender_role: user ? user.role : session.role
        }
      });
    } else {
      const result = await dbRun(
        'INSERT INTO mentorship_chats (request_id, sender_id, message) VALUES (?, ?, ?)',
        [requestIdInt, session.id, message.trim()]
      );
      
      const insertedChat = {
        id: result.id,
        request_id: requestIdInt,
        sender_id: session.id,
        message: message.trim(),
        created_at: new Date().toISOString(),
        sender_name: session.name,
        sender_role: session.role
      };

      return NextResponse.json({
        message: 'Message sent successfully',
        chat: insertedChat
      });
    }
  } catch (error) {
    console.error('Send Chat API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while sending message' },
      { status: 500 }
    );
  }
}
