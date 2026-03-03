import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending_approval';

    const jobs = await sql`
      SELECT 
        j.*,
        u.name as user_name,
        u.email as user_email,
        reviewer.name as reviewed_by_name
      FROM jobs j
      LEFT JOIN users u ON j.user_id = u.id
      LEFT JOIN users reviewer ON j.reviewed_by = reviewer.id
      WHERE j.approval_status = ${status}
      ORDER BY j.created_at DESC
    `;

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { jobId, action, adminId, reason } = await request.json();

    if (!jobId || !action || !adminId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action === 'approve') {
      await sql`
        UPDATE jobs 
        SET 
          approval_status = 'approved',
          reviewed_by = ${adminId},
          reviewed_at = NOW(),
          status = 'open'
        WHERE id = ${jobId}
      `;
    } else if (action === 'reject') {
      if (!reason) {
        return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
      }
      await sql`
        UPDATE jobs 
        SET 
          approval_status = 'rejected',
          reviewed_by = ${adminId},
          reviewed_at = NOW(),
          rejection_reason = ${reason},
          status = 'closed'
        WHERE id = ${jobId}
      `;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}
