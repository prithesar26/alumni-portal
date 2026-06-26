import { NextResponse } from 'next/server';
import { dbQuery, dbRun } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const discussionId = parseInt(id, 10);

    const comments = await dbQuery(
      `SELECT c.*, u.name as author_name, u.role as author_role, u.company as author_company, u.job_title as author_title
       FROM comments c
       JOIN users u ON c.author_id = u.id
       WHERE c.discussion_id = ?
       ORDER BY c.created_at ASC`,
      [discussionId]
    );

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Fetch Comments API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching comments' },
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
    const discussionId = parseInt(id, 10);

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Insert comment
    const result = await dbRun(
      `INSERT INTO comments (discussion_id, content, author_id)
       VALUES (?, ?, ?)`,
      [discussionId, content, session.id]
    );

    // Fetch the newly created comment to return it
    const newComment = await dbQuery(
      `SELECT c.*, u.name as author_name, u.role as author_role, u.company as author_company, u.job_title as author_title
       FROM comments c
       JOIN users u ON c.author_id = u.id
       WHERE c.id = ?`,
      [result.id]
    );

    return NextResponse.json({
      message: 'Comment posted successfully',
      comment: newComment[0]
    });
  } catch (error) {
    console.error('Create Comment API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating comment' },
      { status: 500 }
    );
  }
}
