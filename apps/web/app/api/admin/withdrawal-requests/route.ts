import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    let withdrawalRequests: any[];

    if (status && status !== 'all' && userId) {
      withdrawalRequests = await sql`
        SELECT 
          wr.*,
          u.name as user_name,
          u.email as user_email,
          u.phone as user_phone,
          pm.method_type,
          pm.provider,
          pm.account_holder_name,
          pm.account_number,
          pm.bank_name,
          pm.paypal_email
        FROM withdrawal_requests wr
        JOIN users u ON wr.user_id = u.id
        LEFT JOIN payment_methods pm ON wr.payment_method_id = pm.id
        WHERE wr.status = ${status} AND wr.user_id = ${parseInt(userId)}
        ORDER BY wr.created_at DESC
      `;
    } else if (status && status !== 'all') {
      withdrawalRequests = await sql`
        SELECT 
          wr.*,
          u.name as user_name,
          u.email as user_email,
          u.phone as user_phone,
          pm.method_type,
          pm.provider,
          pm.account_holder_name,
          pm.account_number,
          pm.bank_name,
          pm.paypal_email
        FROM withdrawal_requests wr
        JOIN users u ON wr.user_id = u.id
        LEFT JOIN payment_methods pm ON wr.payment_method_id = pm.id
        WHERE wr.status = ${status}
        ORDER BY wr.created_at DESC
      `;
    } else if (userId) {
      withdrawalRequests = await sql`
        SELECT 
          wr.*,
          u.name as user_name,
          u.email as user_email,
          u.phone as user_phone,
          pm.method_type,
          pm.provider,
          pm.account_holder_name,
          pm.account_number,
          pm.bank_name,
          pm.paypal_email
        FROM withdrawal_requests wr
        JOIN users u ON wr.user_id = u.id
        LEFT JOIN payment_methods pm ON wr.payment_method_id = pm.id
        WHERE wr.user_id = ${parseInt(userId)}
        ORDER BY wr.created_at DESC
      `;
    } else {
      withdrawalRequests = await sql`
        SELECT 
          wr.*,
          u.name as user_name,
          u.email as user_email,
          u.phone as user_phone,
          pm.method_type,
          pm.provider,
          pm.account_holder_name,
          pm.account_number,
          pm.bank_name,
          pm.paypal_email
        FROM withdrawal_requests wr
        JOIN users u ON wr.user_id = u.id
        LEFT JOIN payment_methods pm ON wr.payment_method_id = pm.id
        ORDER BY wr.created_at DESC
      `;
    }

    return NextResponse.json({ withdrawalRequests });
  } catch (error: any) {
    console.error('Error fetching withdrawal requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch withdrawal requests' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, notes } = body;

    if (!id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Get withdrawal request details
      const [withdrawal] = await sql`
        SELECT * FROM withdrawal_requests WHERE id = ${id}
      `;

      if (!withdrawal) {
        return NextResponse.json(
          { error: 'Withdrawal request not found' },
          { status: 404 }
        );
      }

      // Check if user has enough balance
      const [wallet] = await sql`
        SELECT * FROM wallets WHERE user_id = ${withdrawal.user_id}
      `;

      if (wallet.balance < withdrawal.amount) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        );
      }

      // Update withdrawal request
      await sql`
        UPDATE withdrawal_requests
        SET 
          status = 'approved',
          processed_at = NOW(),
          notes = ${notes || ''}
        WHERE id = ${id}
      `;

      // Deduct from wallet
      await sql`
        UPDATE wallets
        SET balance = balance - ${withdrawal.amount}
        WHERE user_id = ${withdrawal.user_id}
      `;

      // Create transaction record
      await sql`
        INSERT INTO wallet_transactions (user_id, type, amount, description, related_type, related_id)
        VALUES (
          ${withdrawal.user_id},
          'withdrawal',
          ${withdrawal.amount},
          'Withdrawal approved',
          'withdrawal_request',
          ${id}
        )
      `;

    } else if (action === 'reject') {
      if (!notes) {
        return NextResponse.json(
          { error: 'Rejection reason is required' },
          { status: 400 }
        );
      }

      await sql`
        UPDATE withdrawal_requests
        SET 
          status = 'rejected',
          processed_at = NOW(),
          notes = ${notes}
        WHERE id = ${id}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating withdrawal request:', error);
    return NextResponse.json(
      { error: 'Failed to update withdrawal request' },
      { status: 500 }
    );
  }
}
