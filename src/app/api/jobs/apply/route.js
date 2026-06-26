import { NextResponse } from 'next/server';
import { dbQuery, dbRun, dbGet } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// GET: Fetch applications (list submitted by student OR received by alumni)
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role === 'student') {
      // Students view applications they submitted
      const applications = await dbQuery(
        `SELECT ja.*, j.title as job_title, j.company as job_company, j.location as job_location, j.type as job_type 
         FROM job_applications ja
         JOIN jobs j ON ja.job_id = j.id
         WHERE ja.student_id = ?
         ORDER BY ja.created_at DESC`,
        [session.id]
      );
      return NextResponse.json({ applications });
    } else if (session.role === 'alumni') {
      // Alumni view applications received for their posted jobs
      const applications = await dbQuery(
        `SELECT ja.*, u.name as student_name, u.branch as student_branch, u.grad_year as student_grad_year, u.email as student_email, u.skills as student_skills, j.title as job_title 
         FROM job_applications ja
         JOIN users u ON ja.student_id = u.id
         JOIN jobs j ON ja.job_id = j.id
         WHERE j.posted_by = ?
         ORDER BY ja.created_at DESC`,
        [session.id]
      );
      return NextResponse.json({ applications });
    }

    return NextResponse.json({ error: 'Invalid user role' }, { status: 400 });
  } catch (error) {
    console.error('Fetch Applications API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching applications' },
      { status: 500 }
    );
  }
}

// POST: Submit a new job application
export async function POST(request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can submit job applications' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { jobId, coverLetter, resumeUrl } = body;

    if (!jobId || !resumeUrl) {
      return NextResponse.json(
        { error: 'Job ID and resume link/URL are required' },
        { status: 400 }
      );
    }

    const jobIdInt = parseInt(jobId, 10);

    // Verify job exists and accepts portal applications
    const job = await dbGet('SELECT accepts_portal_applications FROM jobs WHERE id = ?', [jobIdInt]);
    if (!job) {
      return NextResponse.json({ error: 'Job listing not found' }, { status: 404 });
    }

    if (job.accepts_portal_applications === 0) {
      return NextResponse.json(
        { error: 'This job listing does not accept internal portal applications' },
        { status: 400 }
      );
    }

    // Check if student has already applied
    const existing = await dbGet(
      'SELECT id FROM job_applications WHERE student_id = ? AND job_id = ?',
      [session.id, jobIdInt]
    );

    if (existing) {
      return NextResponse.json(
        { error: 'You have already applied for this position' },
        { status: 400 }
      );
    }

    // Insert job application record
    const result = await dbRun(
      `INSERT INTO job_applications (job_id, student_id, cover_letter, resume_url)
       VALUES (?, ?, ?, ?)`,
      [jobIdInt, session.id, coverLetter || '', resumeUrl]
    );

    return NextResponse.json({
      message: 'Application submitted successfully',
      applicationId: result.id
    });
  } catch (error) {
    console.error('Submit Application API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during application submission' },
      { status: 500 }
    );
  }
}

// PUT: Update job application status (alumni only)
export async function PUT(request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'alumni') {
      return NextResponse.json(
        { error: 'Only alumni who posted the job can update application status' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { applicationId, status } = body;

    if (!applicationId || !status || !['shortlisted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Application ID and valid status (shortlisted/rejected) are required' },
        { status: 400 }
      );
    }

    const appIdInt = parseInt(applicationId, 10);

    // Verify application exists and the job was posted by the current user
    const app = await dbGet(
      `SELECT ja.id 
       FROM job_applications ja
       JOIN jobs j ON ja.job_id = j.id
       WHERE ja.id = ? AND j.posted_by = ?`,
      [appIdInt, session.id]
    );

    if (!app) {
      return NextResponse.json(
        { error: 'Application not found or you are not authorized to manage it' },
        { status: 404 }
      );
    }

    // Update status
    await dbRun(
      'UPDATE job_applications SET status = ? WHERE id = ?',
      [status, appIdInt]
    );

    return NextResponse.json({
      message: `Application ${status} successfully`
    });
  } catch (error) {
    console.error('Update Application API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating application status' },
      { status: 500 }
    );
  }
}
