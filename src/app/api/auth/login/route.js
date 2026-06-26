import { NextResponse } from 'next/server';
import { dbGet } from '@/lib/db';
import { comparePassword, setSessionCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get user from DB
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare passwords
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Clean user object for the response
    const cleanUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    // Set cookie
    await setSessionCookie(cleanUser);

    return NextResponse.json({
      message: 'Login successful',
      user: cleanUser
    });
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login' },
      { status: 500 }
    );
  }
}
