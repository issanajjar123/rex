import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    const { name, email, phone, password, role } = await request.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 });
    }

    // Create new user
    const users = await sql`
      INSERT INTO users (name, email, phone, password, role, kyc_status)
      VALUES (${name}, ${email}, ${phone}, ${password}, ${role || 'user'}, 'pending')
      RETURNING id, email, name, phone, role, kyc_status, avatar, bio
    `;

    // Create wallet for user
    await sql`
      INSERT INTO wallets (user_id, balance, held_balance)
      VALUES (${users[0].id}, 0, 0)
    `;

    return NextResponse.json({ user: users[0] });
  } catch (error) {
    console.error('خطأ في التسجيل:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
