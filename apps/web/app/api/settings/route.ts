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

    const users = await sql`
      SELECT language, notifications_enabled, dark_mode
      FROM users 
      WHERE id = ${userId}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    return NextResponse.json(users[0]);
  } catch (error) {
    console.error('خطأ في جلب الإعدادات:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { user_id, language, notifications_enabled, dark_mode, password } = body;

    if (password) {
      // Update password
      await sql`
        UPDATE users
        SET password = ${password}
        WHERE id = ${user_id}
      `;
      return NextResponse.json({ message: 'تم تحديث كلمة المرور بنجاح' });
    }

    // Update settings
    const users = await sql`
      UPDATE users
      SET language = COALESCE(${language}, language),
          notifications_enabled = COALESCE(${notifications_enabled}, notifications_enabled),
          dark_mode = COALESCE(${dark_mode}, dark_mode)
      WHERE id = ${user_id}
      RETURNING language, notifications_enabled, dark_mode
    `;

    return NextResponse.json(users[0]);
  } catch (error) {
    console.error('خطأ في تحديث الإعدادات:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
