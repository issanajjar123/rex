import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const kycStatus = searchParams.get('kyc_status') || '';

    // Build WHERE conditions
    const conditions = [];
    if (search) {
      conditions.push(`(u.name ILIKE '%${search}%' OR u.email ILIKE '%${search}%')`);
    }
    if (role) {
      conditions.push(`u.role = '${role}'`);
    }
    if (kycStatus) {
      conditions.push(`u.kyc_status = '${kycStatus}'`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const users = await sql`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.phone,
        u.role,
        u.kyc_status,
        u.avatar,
        u.bio,
        u.created_at,
        w.balance,
        w.held_balance
      FROM users u
      LEFT JOIN wallets w ON u.id = w.user_id
      ${sql.unsafe(whereClause)}
      ORDER BY u.created_at DESC
    `;

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب المستخدمين' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, action, role } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'معرف المستخدم والإجراء مطلوبان' },
        { status: 400 }
      );
    }

    if (action === 'change_role') {
      if (!role) {
        return NextResponse.json(
          { error: 'الدور الجديد مطلوب' },
          { status: 400 }
        );
      }

      await sql`
        UPDATE users 
        SET role = ${role}
        WHERE id = ${userId}
      `;

      return NextResponse.json({ success: true, message: 'تم تحديث دور المستخدم' });
    }

    return NextResponse.json(
      { error: 'إجراء غير معروف' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث المستخدم' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    // حذف جميع البيانات المرتبطة بالمستخدم
    await sql`DELETE FROM messages WHERE sender_id = ${userId}`;
    await sql`DELETE FROM chats WHERE user_id = ${userId} OR other_user_id = ${userId}`;
    await sql`DELETE FROM job_applications WHERE user_id = ${userId}`;
    await sql`DELETE FROM jobs WHERE user_id = ${userId}`;
    await sql`DELETE FROM projects WHERE user_id = ${userId}`;
    await sql`DELETE FROM offers WHERE user_id = ${userId}`;
    await sql`DELETE FROM wallet_transactions WHERE user_id = ${userId}`;
    await sql`DELETE FROM wallets WHERE user_id = ${userId}`;
    await sql`DELETE FROM withdrawal_requests WHERE user_id = ${userId}`;
    await sql`DELETE FROM payment_methods WHERE user_id = ${userId}`;
    await sql`DELETE FROM kyc_verifications WHERE user_id = ${userId}`;
    await sql`DELETE FROM users WHERE id = ${userId}`;

    return NextResponse.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف المستخدم' },
      { status: 500 }
    );
  }
}
