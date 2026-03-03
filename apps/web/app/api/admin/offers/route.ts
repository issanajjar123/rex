import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending_approval';

    const offers = await sql`
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email,
        reviewer.name as reviewed_by_name
      FROM offers o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN users reviewer ON o.reviewed_by = reviewer.id
      WHERE o.approval_status = ${status}
      ORDER BY o.created_at DESC
    `;

    return NextResponse.json({ offers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { offerId, action, adminId, reason } = await request.json();

    if (!offerId || !action || !adminId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action === 'approve') {
      await sql`
        UPDATE offers 
        SET 
          approval_status = 'approved',
          reviewed_by = ${adminId},
          reviewed_at = NOW(),
          status = 'active'
        WHERE id = ${offerId}
      `;
    } else if (action === 'reject') {
      if (!reason) {
        return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
      }
      await sql`
        UPDATE offers 
        SET 
          approval_status = 'rejected',
          reviewed_by = ${adminId},
          reviewed_at = NOW(),
          rejection_reason = ${reason},
          status = 'inactive'
        WHERE id = ${offerId}
      `;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating offer:', error);
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
  }
}
