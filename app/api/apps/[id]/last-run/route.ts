import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken, formatTimeAgo } from '@/lib/auth';
import { query } from '@/lib/db';

/**
 * GET /api/apps/[id]/last-run
 * Get last run time for current user and app
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

    const result = await query(
      `SELECT last_run_at FROM user_app_last_run
       WHERE user_id = $1 AND app_id = $2`,
      [payload.userId, params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          appId: params.id,
          lastRunAt: null,
          timeAgo: null,
        },
        { status: 200 }
      );
    }

    const lastRunAt = result.rows[0].last_run_at;

    return NextResponse.json(
      {
        appId: params.id,
        lastRunAt,
        timeAgo: formatTimeAgo(new Date(lastRunAt)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Last run fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/apps/[id]/last-run
 * Update last run time for current user and app
 */
export async function PUT(
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

    const result = await query(
      `INSERT INTO user_app_last_run
       (user_id, app_id, last_run_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, app_id)
       DO UPDATE SET last_run_at = NOW()
       RETURNING last_run_at`,
      [payload.userId, params.id]
    );

    const lastRunAt = result.rows[0].last_run_at;

    return NextResponse.json(
      {
        appId: params.id,
        lastRunAt,
        timeAgo: formatTimeAgo(new Date(lastRunAt)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Last run update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
