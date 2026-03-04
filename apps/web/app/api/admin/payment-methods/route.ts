import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    let query = `
      SELECT 
        pm.id,
        pm.user_id,
        pm.method_type,
        pm.provider,
        pm.account_holder_name,
        pm.account_number,
        pm.bank_name,
        pm.iban,
        pm.swift_code,
        pm.paypal_email,
        pm.is_default,
        pm.is_verified,
        pm.created_at,
        pm.approval_status,
        pm.approved_by,
        pm.approved_at,
        pm.rejection_reason,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        approver.name as approved_by_name
      FROM payment_methods pm
      JOIN users u ON pm.user_id = u.id
      LEFT JOIN users approver ON pm.approved_by = approver.id
      WHERE 1=1
    `;

    if (status && status !== 'all') {
      query += ` AND pm.approval_status = '${status}'`;
    }

    if (userId) {
      query += ` AND pm.user_id = ${userId}`;
    }

    query += ` ORDER BY pm.created_at DESC`;

    const paymentMethods = await sql(query);

    return NextResponse.json({ paymentMethods });
  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, adminId, reason } = body;

    if (!id || !action || !adminId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      const adminIdNum = parseInt(adminId as string);
      await sql`
        UPDATE payment_methods
        SET 
          approval_status = 'approved',
          approved_by = ${adminIdNum},
          approved_at = NOW(),
          is_verified = true
        WHERE id = ${id}
      `;
    } else if (action === 'reject') {
      if (!reason) {
        return NextResponse.json(
          { error: 'Rejection reason is required' },
          { status: 400 }
        );
      }

      const adminIdNum = parseInt(adminId as string);
      await sql`
        UPDATE payment_methods
        SET 
          approval_status = 'rejected',
          approved_by = ${adminIdNum},
          approved_at = NOW(),
          rejection_reason = ${reason},
          is_verified = false
        WHERE id = ${id}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating payment method:', error);
    return NextResponse.json(
      { error: 'Failed to update payment method' },
      { status: 500 }
    );
  }
}
