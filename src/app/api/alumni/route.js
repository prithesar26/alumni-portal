import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let alumni;
    if (search) {
      const searchPattern = `%${search}%`;
      alumni = await dbQuery(
        `SELECT id, name, email, branch, grad_year, company, job_title, bio, skills, profile_picture, linkedin_url, github_url 
         FROM users 
         WHERE role = 'alumni' 
           AND (name LIKE ? OR company LIKE ? OR skills LIKE ? OR branch LIKE ? OR job_title LIKE ?)
         ORDER BY grad_year DESC, name ASC`,
        [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]
      );
    } else {
      alumni = await dbQuery(
        `SELECT id, name, email, branch, grad_year, company, job_title, bio, skills, profile_picture, linkedin_url, github_url 
         FROM users 
         WHERE role = 'alumni' 
         ORDER BY grad_year DESC, name ASC`
      );
    }

    return NextResponse.json({ alumni });
  } catch (error) {
    console.error('Fetch Alumni Directory API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching alumni' },
      { status: 500 }
    );
  }
}
