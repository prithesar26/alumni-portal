import { NextResponse } from 'next/server';
import { dbQuery, dbRun } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';

    let discussions;
    if (category) {
      discussions = await dbQuery(
        `SELECT d.*, u.name as author_name, u.role as author_role, u.company as author_company, u.job_title as author_title,
                (SELECT COUNT(*) FROM comments c WHERE c.discussion_id = d.id) as comment_count
         FROM discussions d
         JOIN users u ON d.author_id = u.id
         WHERE d.category = ?
         ORDER BY d.created_at DESC`,
        [category]
      );
    } else {
      discussions = await dbQuery(
        `SELECT d.*, u.name as author_name, u.role as author_role, u.company as author_company, u.job_title as author_title,
                (SELECT COUNT(*) FROM comments c WHERE c.discussion_id = d.id) as comment_count
         FROM discussions d
         JOIN users u ON d.author_id = u.id
         ORDER BY d.created_at DESC`
      );
    }

    return NextResponse.json({ discussions });
  } catch (error) {
    console.error('Fetch Discussions API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching discussions' },
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
    const { title, content, category } = body;

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }

    // Insert discussion
    const result = await dbRun(
      `INSERT INTO discussions (title, content, category, author_id)
       VALUES (?, ?, ?, ?)`,
      [title, content, category, session.id]
    );

    return NextResponse.json({
      message: 'Discussion created successfully',
      discussionId: result.id
    });
  } catch (error) {
    console.error('Create Discussion API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating discussion' },
      { status: 500 }
    );
  }
}
