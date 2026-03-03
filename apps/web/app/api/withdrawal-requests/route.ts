import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });
    }

    const requests = await sql`
      SELECT wr.*, pm.method_type, pm.provider
      FROM withdrawal_requests wr
      LEFT JOIN payment_methods pm ON wr.payment_method_id = pm.id
      WHERE wr.user_id = ${userId}
      ORDER BY wr.created_at DESC
    `;

    return NextResponse.json(requests);
  } catch (error) {
    console.error('خطأ في جلب طلبات السحب:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, amount, payment_method_id } = body;

    // Check wallet balance
    const wallets = await sql`
      SELECT balance FROM wallets WHERE user_id = ${user_id}
    `;

    if (wallets.length === 0 || parseFloat(wallets[0].balance) < amount) {
      return NextResponse.json({ error: 'رصيد غير كافٍ' }, { status: 400 });
    }

    // Create withdrawal request
    const requests = await sql`
      INSERT INTO withdrawal_requests (user_id, amount, payment_method_id, status)
      VALUES (${user_id}, ${amount}, ${payment_method_id}, 'pending')
      RETURNING *
    `;

    // Deduct from wallet balance and add to held
    await sql`
      UPDATE wallets
      SET balance = balance - ${amount}, held_balance = held_balance + ${amount}
      WHERE user_id = ${user_id}
    `;

    // Record transaction
    await sql`
      INSERT INTO wallet_transactions (user_id, type, amount, description, related_type, related_id)
      VALUES (${user_id}, 'withdrawal', ${amount}, 'طلب سحب', 'withdrawal', ${requests[0].id})
    `;

    return NextResponse.json(requests[0]);
  } catch (error) {
    console.error('خطأ في طلب السحب:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
