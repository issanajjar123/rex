import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await sql`
      SELECT 
        wr.*,
        pm.provider,
        pm.account_holder_name,
        pm.bank_name,
        pm.account_number
      FROM withdrawal_requests wr
      LEFT JOIN payment_methods pm ON wr.payment_method_id = pm.id
      WHERE wr.user_id = ${parseInt(userId)}
      ORDER BY wr.created_at DESC
    `;

    return NextResponse.json(requests);
  } catch (error: any) {
    console.error('Withdrawal requests fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch withdrawal requests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, payment_method_id } = body;

    if (!amount || amount <= 0 || !payment_method_id) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Check wallet balance
    const wallet = await sql`
      SELECT * FROM wallets WHERE user_id = ${parseInt(userId)}
    `;

    if (wallet.length === 0 || parseFloat(wallet[0].balance) < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Verify payment method belongs to user
    const paymentMethod = await sql`
      SELECT * FROM payment_methods
      WHERE id = ${payment_method_id} AND user_id = ${parseInt(userId)}
    `;

    if (paymentMethod.length === 0) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    // Create withdrawal request
    const request_result = await sql`
      INSERT INTO withdrawal_requests (
        user_id,
        amount,
        payment_method_id,
        status
      ) VALUES (
        ${parseInt(userId)},
        ${amount},
        ${payment_method_id},
        'pending'
      )
      RETURNING *
    `;

    // Deduct from wallet balance and add to held balance
    await sql`
      UPDATE wallets
      SET 
        balance = balance - ${amount},
        held_balance = held_balance + ${amount},
        updated_at = NOW()
      WHERE user_id = ${parseInt(userId)}
    `;

    // Record transaction
    await sql`
      INSERT INTO wallet_transactions (user_id, type, amount, description, related_type, related_id)
      VALUES (
        ${parseInt(userId)},
        'withdraw',
        ${amount},
        ${`Withdrawal request submitted - $${amount}`},
        'withdrawal_request',
        ${request_result[0].id}
      )
    `;

    return NextResponse.json({ 
      success: true,
      request: request_result[0],
      message: 'Withdrawal request submitted successfully'
    });
  } catch (error: any) {
    console.error('Withdrawal request error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit withdrawal request' }, { status: 500 });
  }
}
