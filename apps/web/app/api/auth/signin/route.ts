import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }, { status: 400 });
    }

    const users = await sql`
      SELECT id, email, name, phone, role, kyc_status, avatar, bio, language, notifications_enabled, dark_mode
      FROM users 
      WHERE email = ${email} AND password = ${password}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 });
    }

    return NextResponse.json({ user: users[0] });
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
