import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    let escrowTransactions;

    if (status) {
      escrowTransactions = await sql`
        SELECT 
          e.*,
          buyer.name as buyer_name,
          buyer.email as buyer_email,
          seller.name as seller_name,
          seller.email as seller_email
        FROM escrow_transactions e
        JOIN users buyer ON e.buyer_id = buyer.id
        JOIN users seller ON e.seller_id = seller.id
        WHERE e.status = ${status}
        ORDER BY e.created_at DESC
      `;
    } else {
      escrowTransactions = await sql`
        SELECT 
          e.*,
          buyer.name as buyer_name,
          buyer.email as buyer_email,
          seller.name as seller_name,
          seller.email as seller_email
        FROM escrow_transactions e
        JOIN users buyer ON e.buyer_id = buyer.id
        JOIN users seller ON e.seller_id = seller.id
        ORDER BY e.created_at DESC
      `;
    }

    return NextResponse.json({ escrowTransactions });
  } catch (error) {
    console.error('Get escrow error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب معاملات الضمان' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { escrowId, action, notes } = await request.json();

    if (!escrowId || !action) {
      return NextResponse.json(
        { error: 'معرف المعاملة والإجراء مطلوبان' },
        { status: 400 }
      );
    }

    const escrow = await sql`
      SELECT * FROM escrow_transactions WHERE id = ${escrowId}
    `;

    if (escrow.length === 0) {
      return NextResponse.json(
        { error: 'معاملة الضمان غير موجودة' },
        { status: 404 }
      );
    }

    if (action === 'release') {
      // إطلاق الأموال للبائع
      const netAmount = escrow[0].amount - escrow[0].commission;

      await sql`
        UPDATE escrow_transactions
        SET status = 'released', released_at = NOW(), notes = ${notes || ''}
        WHERE id = ${escrowId}
      `;

      await sql`
        UPDATE wallets
        SET held_balance = held_balance - ${escrow[0].amount},
            balance = balance + ${netAmount}
        WHERE user_id = ${escrow[0].seller_id}
      `;

      await sql`
        INSERT INTO wallet_transactions (user_id, type, amount, description, related_type, related_id)
        VALUES (
          ${escrow[0].seller_id},
          'escrow_release',
          ${netAmount},
          'إطلاق أموال من الضمان',
          'escrow',
          ${escrowId}
        )
      `;

      return NextResponse.json({ success: true, message: 'تم إطلاق الأموال للبائع' });
    } else if (action === 'cancel') {
      // إلغاء وإرجاع الأموال للمشتري
      await sql`
        UPDATE escrow_transactions
        SET status = 'cancelled', notes = ${notes || ''}
        WHERE id = ${escrowId}
      `;

      await sql`
        UPDATE wallets
        SET held_balance = held_balance - ${escrow[0].amount},
            balance = balance + ${escrow[0].amount}
        WHERE user_id = ${escrow[0].buyer_id}
      `;

      await sql`
        INSERT INTO wallet_transactions (user_id, type, amount, description, related_type, related_id)
        VALUES (
          ${escrow[0].buyer_id},
          'escrow_refund',
          ${escrow[0].amount},
          'إرجاع أموال من الضمان',
          'escrow',
          ${escrowId}
        )
      `;

      return NextResponse.json({ success: true, message: 'تم إلغاء المعاملة وإرجاع الأموال' });
    }

    return NextResponse.json(
      { error: 'إجراء غير معروف' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Process escrow error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في معالجة معاملة الضمان' },
      { status: 500 }
    );
  }
}
