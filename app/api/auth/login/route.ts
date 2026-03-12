import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createToken } from '@/lib/auth';

/**
 * POST /api/auth/login
 * Login with email (password optional for now - accepts any email)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email) {
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
      // For now, create user on first login if they provide email
      // In production, you'd validate password against hashed password
      await query(
        `INSERT INTO users
         (email, full_name, org_unit, classification_level)
         VALUES ($1, $2, $3, $4)`,
        [email, email.split('@')[0].toUpperCase(), 'Analyst', 'UNCLASSIFIED']
      );

      const newResult = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      const newUser = newResult.rows[0];
      const token = createToken(newUser.id, newUser.email);

      return NextResponse.json(
        {
          token,
          user: {
            id: newUser.id,
            email: newUser.email,
            fullName: newUser.full_name,
            orgUnit: newUser.org_unit,
            classificationLevel: newUser.classification_level,
          },
        },
        { status: 200 }
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
