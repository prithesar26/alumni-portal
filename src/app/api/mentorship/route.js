import { NextResponse } from 'next/server';
import { dbQuery, dbRun, dbGet } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let requests;
    if (session.role === 'student') {
      // Students view their sent requests and join with alumni details
      requests = await dbQuery(
        `SELECT mr.*, u.name as partner_name, u.company as partner_company, u.job_title as partner_title, u.email as partner_email
         FROM mentorship_requests mr
         JOIN users u ON mr.alumni_id = u.id
         WHERE mr.student_id = ?
         ORDER BY mr.created_at DESC`,
        [session.id]
      );
    } else {
      // Alumni view incoming requests and join with student details
      requests = await dbQuery(
        `SELECT mr.*, u.name as partner_name, u.branch as partner_branch, u.grad_year as partner_grad_year, u.email as partner_email
         FROM mentorship_requests mr
         JOIN users u ON mr.student_id = u.id
         WHERE mr.alumni_id = ?
         ORDER BY mr.created_at DESC`,
        [session.id]
      );
    }

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Fetch Mentorship API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching mentorship requests' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can request mentorship' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { alumniId, topic, message, purpose, questions, preferredTime, expectedCareerGoal } = body;

    if (!alumniId || !topic || !message || !purpose || !questions || !preferredTime || !expectedCareerGoal) {
      return NextResponse.json(
        { error: 'Alumni ID, topic, message, purpose, questions, preferred meeting time, and career goal are required' },
        { status: 400 }
      );
    }

    const alumniIdInt = parseInt(alumniId, 10);

    // Verify recipient is actually an alumni
    const alumni = await dbGet('SELECT role FROM users WHERE id = ?', [alumniIdInt]);
    if (!alumni || alumni.role !== 'alumni') {
      return NextResponse.json(
        { error: 'Selected mentor is not a registered alumnus' },
        { status: 404 }
      );
    }

    // Check if request already exists to prevent duplication
    const existing = await dbGet(
      'SELECT id FROM mentorship_requests WHERE student_id = ? AND alumni_id = ? AND status = "pending"',
      [session.id, alumniIdInt]
    );
    if (existing) {
      return NextResponse.json(
        { error: 'You already have a pending mentorship request with this alumnus' },
        { status: 400 }
      );
    }

    // Insert request
    const result = await dbRun(
      `INSERT INTO mentorship_requests (student_id, alumni_id, topic, message, purpose, questions, preferred_time, expected_career_goal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [session.id, alumniIdInt, topic, message, purpose, questions, preferredTime, expectedCareerGoal]
    );

    return NextResponse.json({
      message: 'Mentorship request sent successfully',
      requestId: result.id
    });
  } catch (error) {
    console.error('Request Mentorship API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while requesting mentorship' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'alumni') {
      return NextResponse.json(
        { error: 'Only alumni can accept or decline mentorship requests' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { requestId, status } = body;

    if (!requestId || !status || !['accepted', 'declined'].includes(status)) {
      return NextResponse.json(
        { error: 'Request ID and valid status (accepted/declined) are required' },
        { status: 400 }
      );
    }

    const requestIdInt = parseInt(requestId, 10);

    // Verify request ownership and update status
    const req = await dbGet(
      'SELECT id FROM mentorship_requests WHERE id = ? AND alumni_id = ?',
      [requestIdInt, session.id]
    );
    if (!req) {
      return NextResponse.json(
        { error: 'Mentorship request not found or not assigned to you' },
        { status: 404 }
      );
    }

    await dbRun(
      'UPDATE mentorship_requests SET status = ? WHERE id = ?',
      [status, requestIdInt]
    );

    return NextResponse.json({
      message: `Mentorship request ${status} successfully`
    });
  } catch (error) {
    console.error('Update Mentorship API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating mentorship request' },
      { status: 500 }
    );
  }
}
