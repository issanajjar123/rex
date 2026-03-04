'use server';

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('target_user_id');
    const action = searchParams.get('action');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 50;
    const offset = (page - 1) * limit;

    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = 'SELECT a.*, u.name as admin_name FROM audit_logs a LEFT JOIN users u ON a.admin_id = u.id WHERE 1=1';
    const params: any[] = [];

    if (targetUserId) {
      query += ` AND a.target_user_id = $${params.length + 1}`;
      params.push(targetUserId);
    }

    if (action) {
      query += ` AND a.action = $${params.length + 1}`;
      params.push(action);
    }

    query += ` ORDER BY a.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const logs = await sql(query, params);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total: logs.length
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
