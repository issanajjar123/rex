import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending_approval';

    const projects = await sql`
      SELECT 
        p.*,
        u.name as user_name,
        u.email as user_email,
        reviewer.name as reviewed_by_name
      FROM projects p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN users reviewer ON p.reviewed_by = reviewer.id
      WHERE p.approval_status = ${status}
      ORDER BY p.created_at DESC
    `;

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { projectId, action, adminId, reason } = await request.json();

    if (!projectId || !action || !adminId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action === 'approve') {
      await sql`
        UPDATE projects 
        SET 
          approval_status = 'approved',
          reviewed_by = ${adminId},
          reviewed_at = NOW(),
          status = 'open'
        WHERE id = ${projectId}
      `;
    } else if (action === 'reject') {
      if (!reason) {
        return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
      }
      await sql`
        UPDATE projects 
        SET 
          approval_status = 'rejected',
          reviewed_by = ${adminId},
          reviewed_at = NOW(),
          rejection_reason = ${reason},
          status = 'closed'
        WHERE id = ${projectId}
      `;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}
