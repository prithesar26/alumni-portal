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

    let meetings = [];
    if (connection === 'MOCK') {
      meetings = mockDb.mentorship_meetings
        .filter(m => m.request_id === requestIdInt)
        .sort((a, b) => new Date(b.meeting_time) - new Date(a.meeting_time));
    } else {
      meetings = await dbQuery(
        'SELECT * FROM mentorship_meetings WHERE request_id = ? ORDER BY meeting_time DESC',
        [requestIdInt]
      );
    }

    return NextResponse.json({ meetings });
  } catch (error) {
    console.error('Fetch Meetings API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching meeting sessions' },
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
    const { title, meetingTime, meetingLink } = body;

    if (!title || !meetingTime) {
      return NextResponse.json({ error: 'Title and meeting time are required' }, { status: 400 });
    }

    const connection = await initDb();
    const requestIdInt = parseInt(id, 10);

    if (connection === 'MOCK') {
      const newMeeting = {
        id: mockDb.mentorship_meetings.length + 1,
        request_id: requestIdInt,
        title: title.trim(),
        meeting_time: meetingTime,
        meeting_link: meetingLink || `https://meet.jit.si/AlumniNexus-Session-${requestIdInt}-${mockDb.mentorship_meetings.length + 1}`,
        status: 'scheduled',
        feedback: null,
        created_at: new Date().toISOString()
      };
      mockDb.mentorship_meetings.push(newMeeting);
      
      return NextResponse.json({
        message: 'Meeting scheduled successfully',
        meeting: newMeeting
      });
    } else {
      // Auto-generate link if not provided
      const tempId = Math.floor(1000 + Math.random() * 9000);
      const finalLink = meetingLink || `https://meet.jit.si/AlumniNexus-Session-${requestIdInt}-${tempId}`;

      const result = await dbRun(
        'INSERT INTO mentorship_meetings (request_id, title, meeting_time, meeting_link, status) VALUES (?, ?, ?, ?, "scheduled")',
        [requestIdInt, title.trim(), meetingTime, finalLink]
      );

      const newMeeting = {
        id: result.id,
        request_id: requestIdInt,
        title: title.trim(),
        meeting_time: meetingTime,
        meeting_link: finalLink,
        status: 'scheduled',
        feedback: null,
        created_at: new Date().toISOString()
      };

      return NextResponse.json({
        message: 'Meeting scheduled successfully',
        meeting: newMeeting
      });
    }
  } catch (error) {
    console.error('Schedule Meeting API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while scheduling meeting' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { meetingId, status, feedback } = body;

    if (!meetingId || !status) {
      return NextResponse.json({ error: 'Meeting ID and status are required' }, { status: 400 });
    }

    const connection = await initDb();
    const meetingIdInt = parseInt(meetingId, 10);

    if (connection === 'MOCK') {
      const meetingIdx = mockDb.mentorship_meetings.findIndex(m => m.id === meetingIdInt);
      if (meetingIdx === -1) {
        return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
      }
      
      mockDb.mentorship_meetings[meetingIdx].status = status;
      if (feedback !== undefined) {
        mockDb.mentorship_meetings[meetingIdx].feedback = feedback;
      }
      
      return NextResponse.json({
        message: 'Meeting session updated successfully',
        meeting: mockDb.mentorship_meetings[meetingIdx]
      });
    } else {
      if (feedback !== undefined) {
        await dbRun(
          'UPDATE mentorship_meetings SET status = ?, feedback = ? WHERE id = ?',
          [status, feedback, meetingIdInt]
        );
      } else {
        await dbRun(
          'UPDATE mentorship_meetings SET status = ? WHERE id = ?',
          [status, meetingIdInt]
        );
      }

      return NextResponse.json({
        message: 'Meeting session updated successfully'
      });
    }
  } catch (error) {
    console.error('Update Meeting API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating meeting' },
      { status: 500 }
    );
  }
}
