import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, buyer_id, seller_id, amount, commission, related_type, related_id } = body;

    if (action === 'create') {
      const escrows = await sql`
        INSERT INTO escrow_transactions (buyer_id, seller_id, amount, commission, related_type, related_id, status)
        VALUES (${buyer_id}, ${seller_id}, ${amount}, ${commission || 0}, ${related_type}, ${related_id}, 'held')
        RETURNING *
      `;

      // Deduct from buyer's wallet and add to held balance
      await sql`
        UPDATE wallets
        SET balance = balance - ${amount}, held_balance = held_balance + ${amount}
        WHERE user_id = ${buyer_id}
      `;

      return NextResponse.json(escrows[0]);
    }

    if (action === 'release') {
      const { escrow_id } = body;
      
      const escrows = await sql`
        SELECT * FROM escrow_transactions WHERE id = ${escrow_id}
      `;

      if (escrows.length === 0) {
        return NextResponse.json({ error: 'المعاملة غير موجودة' }, { status: 404 });
      }

      const escrow = escrows[0];

      // Update escrow status
      await sql`
        UPDATE escrow_transactions
        SET status = 'released', released_at = NOW()
        WHERE id = ${escrow_id}
      `;

      // Remove from buyer's held balance
      await sql`
        UPDATE wallets
        SET held_balance = held_balance - ${escrow.amount}
        WHERE user_id = ${escrow.buyer_id}
      `;

      // Add to seller's balance (minus commission)
      const sellerAmount = parseFloat(escrow.amount) - parseFloat(escrow.commission || 0);
      await sql`
        UPDATE wallets
        SET balance = balance + ${sellerAmount}
        WHERE user_id = ${escrow.seller_id}
      `;

      // Record transaction for seller
      await sql`
        INSERT INTO wallet_transactions (user_id, type, amount, description, related_type, related_id)
        VALUES (${escrow.seller_id}, 'credit', ${sellerAmount}, 'إطلاق أموال الضمان', ${escrow.related_type}, ${escrow.related_id})
      `;

      return NextResponse.json({ message: 'تم إطلاق الأموال بنجاح' });
    }

    return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 });
  } catch (error) {
    console.error('خطأ في الضمان:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
