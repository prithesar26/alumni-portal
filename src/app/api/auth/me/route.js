import { NextResponse } from 'next/server';
import { dbGet, dbRun } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await dbGet(
      `SELECT id, email, role, name, branch, grad_year, company, job_title, bio, skills, profile_picture, 
              linkedin_url, github_url, current_semester, cgpa, career_goal, dream_company, 
              interested_domain, learning_progress, projects, is_verified 
       FROM users 
       WHERE id = ?`,
      [session.id]
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Auth Me API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
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

    const body = await request.json();
    const { 
      name, branch, gradYear, company, jobTitle, bio, skills, linkedinUrl, githubUrl,
      currentSemester, cgpa, careerGoal, dreamCompany, interestedDomain, learningProgress, projects
    } = body;

    if (!name || !branch || !gradYear) {
      return NextResponse.json(
        { error: 'Name, branch, and graduation year are required' },
        { status: 400 }
      );
    }

    const gradYearInt = parseInt(gradYear, 10);
    const currentSemesterInt = currentSemester ? parseInt(currentSemester, 10) : null;
    const cgpaFloat = cgpa ? parseFloat(cgpa) : null;

    // Update user record
    await dbRun(
      `UPDATE users 
       SET name = ?, branch = ?, grad_year = ?, company = ?, job_title = ?, bio = ?, skills = ?, linkedin_url = ?, github_url = ?,
           current_semester = ?, cgpa = ?, career_goal = ?, dream_company = ?, interested_domain = ?, learning_progress = ?, projects = ?
       WHERE id = ?`,
      [
        name, branch, gradYearInt, company || null, jobTitle || null, bio || null, skills || '', linkedinUrl || null, githubUrl || null,
        currentSemesterInt, cgpaFloat, careerGoal || null, dreamCompany || null, interestedDomain || null, learningProgress || null, projects || null,
        session.id
      ]
    );

    const updatedUser = await dbGet(
      `SELECT id, email, role, name, branch, grad_year, company, job_title, bio, skills, profile_picture, 
              linkedin_url, github_url, current_semester, cgpa, career_goal, dream_company, 
              interested_domain, learning_progress, projects, is_verified 
       FROM users 
       WHERE id = ?`,
      [session.id]
    );

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update Profile API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during profile update' },
      { status: 500 }
    );
  }
}
