import { NextResponse } from 'next/server';
import { dbGet, dbRun } from '@/lib/db';
import { hashPassword, setSessionCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, role, name, branch, gradYear, company, jobTitle, bio, skills } = body;

    // Basic validation
    if (!email || !password || !role || !name || !branch || !gradYear) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const gradYearInt = parseInt(gradYear, 10);
    const skillList = skills ? skills.trim() : '';

    // Insert user
    const result = await dbRun(
      `INSERT INTO users (email, password_hash, role, name, branch, grad_year, company, job_title, bio, skills) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, passwordHash, role, name, branch, gradYearInt, company || null, jobTitle || null, bio || null, skillList]
    );

    // Fetch the newly created user to get their ID
    const newUser = await dbGet('SELECT id, email, name, role FROM users WHERE email = ?', [email]);

    // Set session cookie
    await setSessionCookie(newUser);

    return NextResponse.json({
      message: 'Registration successful',
      user: newUser
    });
  } catch (error) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    );
  }
}
