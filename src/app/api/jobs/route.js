import { NextResponse } from 'next/server';
import { dbQuery, dbRun } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query all jobs and join with users to get poster's name
    const jobs = await dbQuery(
      `SELECT j.*, u.name as poster_name, u.role as poster_role, u.company as poster_company
       FROM jobs j
       JOIN users u ON j.posted_by = u.id
       ORDER BY j.created_at DESC`
    );

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Fetch Jobs API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching jobs' },
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

    const body = await request.json();
    const { title, company, location, type, description, requirements, salaryRange, applyLink, acceptsPortalApplications } = body;

    if (!title || !company || !location || !type || !description || !requirements) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    const acceptsPortal = acceptsPortalApplications !== undefined ? (acceptsPortalApplications ? 1 : 0) : 1;

    // Insert job posting
    const result = await dbRun(
      `INSERT INTO jobs (title, company, location, type, description, requirements, salary_range, apply_link, accepts_portal_applications, posted_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, company, location, type, description, requirements, salaryRange || null, applyLink || null, acceptsPortal, session.id]
    );

    return NextResponse.json({
      message: 'Job posted successfully',
      jobId: result.id
    });
  } catch (error) {
    console.error('Post Job API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while posting job' },
      { status: 500 }
    );
  }
}
