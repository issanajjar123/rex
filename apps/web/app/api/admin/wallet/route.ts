import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';

    // Get transactions with optional type filter
    const transactions = type 
      ? await sql`
          SELECT 
            wt.*,
            u.name as user_name,
            u.email as user_email
          FROM wallet_transactions wt
          JOIN users u ON wt.user_id = u.id
          WHERE wt.type = ${type}
          ORDER BY wt.created_at DESC LIMIT 100
        `
      : await sql`
          SELECT 
            wt.*,
            u.name as user_name,
            u.email as user_email
          FROM wallet_transactions wt
          JOIN users u ON wt.user_id = u.id
          ORDER BY wt.created_at DESC LIMIT 100
        `;

    // طلبات السحب
    const withdrawals = await sql`
      SELECT 
        wr.*,
        u.name as user_name,
        u.email as user_email,
        pm.method_type,
        pm.account_holder_name,
        pm.account_number,
        pm.bank_name
      FROM withdrawal_requests wr
      JOIN users u ON wr.user_id = u.id
      LEFT JOIN payment_methods pm ON wr.payment_method_id = pm.id
      ORDER BY wr.created_at DESC
    `;

    return NextResponse.json({ transactions, withdrawals });
  } catch (error) {
    console.error('Get wallet data error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب بيانات المحفظة' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, type, description } = await request.json();

    if (!userId || !amount || !type) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // إضافة/خصم رصيد
    if (type === 'deposit') {
      await sql`
        UPDATE wallets 
        SET balance = balance + ${amount}
        WHERE user_id = ${userId}
      `;
    } else if (type === 'withdrawal') {
      await sql`
        UPDATE wallets 
        SET balance = balance - ${amount}
        WHERE user_id = ${userId}
      `;
    }

    // إضافة معاملة
    await sql`
      INSERT INTO wallet_transactions (user_id, type, amount, description)
      VALUES (${userId}, ${type}, ${amount}, ${description || 'تعديل يدوي من المسؤول'})
    `;

    return NextResponse.json({ success: true, message: 'تم تحديث الرصيد بنجاح' });
  } catch (error) {
    console.error('Update wallet error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث الرصيد' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { withdrawalId, action, notes } = await request.json();

    if (!withdrawalId || !action) {
      return NextResponse.json(
        { error: 'معرف الطلب والإجراء مطلوبان' },
        { status: 400 }
      );
    }

    const withdrawal = await sql`
      SELECT * FROM withdrawal_requests WHERE id = ${withdrawalId}
    `;

    if (withdrawal.length === 0) {
      return NextResponse.json(
        { error: 'طلب السحب غير موجود' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // الموافقة على السحب
      await sql`
        UPDATE withdrawal_requests
        SET status = 'completed', processed_at = NOW(), notes = ${notes || ''}
        WHERE id = ${withdrawalId}
      `;

      // خصم من المحفظة
      await sql`
        UPDATE wallets
        SET balance = balance - ${withdrawal[0].amount}
        WHERE user_id = ${withdrawal[0].user_id}
      `;

      // إضافة معاملة
      await sql`
        INSERT INTO wallet_transactions (user_id, type, amount, description, related_type, related_id)
        VALUES (
          ${withdrawal[0].user_id}, 
          'withdrawal', 
          ${withdrawal[0].amount}, 
          'سحب أموال - معتمد',
          'withdrawal_request',
          ${withdrawalId}
        )
      `;

      return NextResponse.json({ success: true, message: 'تمت الموافقة على طلب السحب' });
    } else if (action === 'reject') {
      // رفض السحب
      await sql`
        UPDATE withdrawal_requests
        SET status = 'rejected', processed_at = NOW(), notes = ${notes || ''}
        WHERE id = ${withdrawalId}
      `;

      return NextResponse.json({ success: true, message: 'تم رفض طلب السحب' });
    }

    return NextResponse.json(
      { error: 'إجراء غير معروف' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Process withdrawal error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في معالجة طلب السحب' },
      { status: 500 }
    );
  }
}
