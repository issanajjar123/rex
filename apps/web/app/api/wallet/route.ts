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

    const wallets = await sql`
      SELECT * FROM wallets WHERE user_id = ${userId}
    `;

    if (wallets.length === 0) {
      // Create wallet if doesn't exist
      const newWallets = await sql`
        INSERT INTO wallets (user_id, balance, held_balance)
        VALUES (${userId}, 0, 0)
        RETURNING *
      `;
      return NextResponse.json(newWallets[0]);
    }

    return NextResponse.json(wallets[0]);
  } catch (error) {
    console.error('خطأ في جلب المحفظة:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, amount, type, description } = body;

    if (type === 'deposit') {
      await sql`
        UPDATE wallets
        SET balance = balance + ${amount}
        WHERE user_id = ${user_id}
      `;

      await sql`
        INSERT INTO wallet_transactions (user_id, type, amount, description)
        VALUES (${user_id}, 'credit', ${amount}, ${description || 'إيداع'})
      `;

      return NextResponse.json({ message: 'تم الإيداع بنجاح' });
    }

    return NextResponse.json({ error: 'نوع المعاملة غير صالح' }, { status: 400 });
  } catch (error) {
    console.error('خطأ في المعاملة:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
