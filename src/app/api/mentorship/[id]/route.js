import { NextResponse } from 'next/server';
import { dbQuery, dbGet, initDb, mockDb } from '@/lib/db';
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

    let reqDetails = null;

    if (connection === 'MOCK') {
      const req = mockDb.mentorship_requests.find(r => r.id === requestIdInt);
      if (req) {
        const student = mockDb.users.find(u => u.id === req.student_id);
        const alumni = mockDb.users.find(u => u.id === req.alumni_id);
        
        reqDetails = {
          ...req,
          student_name: student ? student.name : 'Unknown Student',
          student_email: student ? student.email : '',
          student_branch: student ? student.branch : '',
          student_grad_year: student ? student.grad_year : '',
          student_cgpa: student ? student.cgpa : '',
          student_career_goal: student ? student.career_goal : '',
          student_dream_company: student ? student.dream_company : '',
          student_projects: student ? student.projects : '',
          alumni_name: alumni ? alumni.name : 'Unknown Alumni',
          alumni_email: alumni ? alumni.email : '',
          alumni_company: alumni ? alumni.company : '',
          alumni_title: alumni ? alumni.job_title : ''
        };
      }
    } else {
      const rows = await dbQuery(
        `SELECT mr.*, 
                s.name as student_name, s.email as student_email, s.branch as student_branch, s.grad_year as student_grad_year, s.cgpa as student_cgpa, s.career_goal as student_career_goal, s.dream_company as student_dream_company, s.projects as student_projects,
                a.name as alumni_name, a.email as alumni_email, a.company as alumni_company, a.job_title as alumni_title
         FROM mentorship_requests mr
         JOIN users s ON mr.student_id = s.id
         JOIN users a ON mr.alumni_id = a.id
         WHERE mr.id = ?`,
        [requestIdInt]
      );
      if (rows.length > 0) {
        reqDetails = rows[0];
      }
    }

    if (!reqDetails) {
      return NextResponse.json({ error: 'Mentorship connection not found' }, { status: 404 });
    }

    // Verify session user is authorized
    if (reqDetails.student_id !== session.id && reqDetails.alumni_id !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ request: reqDetails });
  } catch (error) {
    console.error('Fetch Connection Details API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching mentorship details' },
      { status: 500 }
    );
  }
}
