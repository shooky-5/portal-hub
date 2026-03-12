import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

/**
 * GET /api/apps/[id]
 * Get a single app by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const result = await query('SELECT * FROM apps WHERE id = $1', [
      params.id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    const app = result.rows[0];

    return NextResponse.json(
      {
        id: app.id,
        name: app.name,
        fullName: app.full_name,
        description: app.description,
        status: app.status,
        url: app.url,
        color: app.color,
        icon: app.icon,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('App fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
