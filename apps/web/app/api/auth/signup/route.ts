import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      );
    }

    // Create new user (في الواقع يجب تشفير كلمة المرور باستخدام bcrypt)
    const result = await sql`
      INSERT INTO users (email, password, name, role, kyc_status, created_at)
      VALUES (${email}, ${password}, ${name}, 'user', 'pending', NOW())
      RETURNING id, email, name, role, kyc_status, avatar, bio, language, notifications_enabled, dark_mode, created_at
    `;

    const user = result[0];

    // Create wallet for new user
    await sql`
      INSERT INTO wallets (user_id, balance, held_balance, created_at, updated_at)
      VALUES (${user.id}, 0, 0, NOW(), NOW())
    `;

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        kyc_status: user.kyc_status,
        avatar: user.avatar,
        bio: user.bio,
        language: user.language,
        notifications_enabled: user.notifications_enabled,
        dark_mode: user.dark_mode,
        created_at: user.created_at
      }
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    );
  }
}
