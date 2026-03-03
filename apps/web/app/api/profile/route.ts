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
      SELECT id, email, name, phone, role, kyc_status, avatar, bio, language, notifications_enabled, dark_mode
      FROM users 
      WHERE id = ${userId}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    return NextResponse.json(users[0]);
  } catch (error) {
    console.error('خطأ في جلب الملف الشخصي:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { user_id, name, phone, bio, avatar } = body;

    const users = await sql`
      UPDATE users
      SET name = ${name}, phone = ${phone}, bio = ${bio || null}, avatar = ${avatar || null}
      WHERE id = ${user_id}
      RETURNING id, email, name, phone, role, kyc_status, avatar, bio
    `;

    return NextResponse.json(users[0]);
  } catch (error) {
    console.error('خطأ في تحديث الملف الشخصي:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
