import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createToken } from '@/lib/auth';

/**
 * POST /api/auth/login
 * Auto-login demo user (demo mode - no password enforcement yet)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email = 'demo@armory.gov', auto = true } = body;

    // For now, just auto-login the demo user
    // In future, we can add password validation here
    if (!auto && !email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get user from database
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Create JWT token
    const token = createToken(user.id, user.email);

    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          orgUnit: user.org_unit,
          classificationLevel: user.classification_level,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
