import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    const { email, phone } = await request.json();

    if (!email && !phone) {
      return NextResponse.json({ error: 'البريد الإلكتروني أو رقم الهاتف مطلوب' }, { status: 400 });
    }

    // Check if user exists
    const users = email 
      ? await sql`SELECT id, email FROM users WHERE email = ${email}`
      : await sql`SELECT id, phone FROM users WHERE phone = ${phone}`;

    if (users.length === 0) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    // In production, you would:
    // 1. Generate a reset token
    // 2. Send email/SMS with reset link
    // 3. Store token in database with expiration

    return NextResponse.json({ 
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور',
      // For demo purposes, return success
      success: true
    });
  } catch (error) {
    console.error('خطأ في إعادة تعيين كلمة المرور:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
