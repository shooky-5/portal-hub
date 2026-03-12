import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken, formatTimeAgo } from '@/lib/auth';
import { query } from '@/lib/db';

/**
 * GET /api/apps/sessions
 * Get recent sessions for current user (paginated)
 */
export async function GET(request: NextRequest) {
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

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    const result = await query(
      `SELECT
        uas.id,
        uas.user_id,
        uas.app_id,
        uas.topic,
        uas.launched_at,
        uas.completed_at,
        a.name as app_name,
        a.color as app_color
      FROM user_app_sessions uas
      JOIN apps a ON uas.app_id = a.id
      WHERE uas.user_id = $1
      ORDER BY uas.launched_at DESC
      LIMIT $2 OFFSET $3`,
      [payload.userId, limit, offset]
    );

    const sessions = result.rows.map((session) => ({
      id: session.id,
      appId: session.app_id,
      appName: session.app_name,
      topic: session.topic,
      launchedAt: session.launched_at,
      timeAgo: formatTimeAgo(new Date(session.launched_at)),
      pillar: session.app_color,
    }));

    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
    console.error('Sessions fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/apps/sessions
 * Record a new app session
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { appId, topic } = body;

    if (!appId) {
      return NextResponse.json(
        { error: 'appId is required' },
        { status: 400 }
      );
    }

    // Insert session
    const sessionResult = await query(
      `INSERT INTO user_app_sessions
       (user_id, app_id, topic, launched_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [payload.userId, appId, topic || null]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to record session' },
        { status: 500 }
      );
    }

    // Update last_run for this app
    const now = new Date();
    await query(
      `INSERT INTO user_app_last_run
       (user_id, app_id, last_run_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, app_id)
       DO UPDATE SET last_run_at = NOW()`,
      [payload.userId, appId]
    );

    return NextResponse.json(
      {
        id: sessionResult.rows[0].id,
        appId: sessionResult.rows[0].app_id,
        topic: sessionResult.rows[0].topic,
        launchedAt: sessionResult.rows[0].launched_at,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
