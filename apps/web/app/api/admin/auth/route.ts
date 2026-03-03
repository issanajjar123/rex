import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get user from database
    const users = await sql`
      SELECT id, email, name, role, phone, avatar, bio, language, 
             notifications_enabled, dark_mode, kyc_status, created_at
      FROM users 
      WHERE email = ${email} 
      AND role = 'admin'
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials or not an admin' },
        { status: 401 }
      );
    }

    const user = users[0];

    // In production, you should hash passwords. For now, simple check
    const passwordUsers = await sql`
      SELECT password FROM users WHERE id = ${user.id}
    `;

    if (passwordUsers.length === 0 || passwordUsers[0].password !== password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Return user data without password
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
        language: user.language,
        notifications_enabled: user.notifications_enabled,
        dark_mode: user.dark_mode,
        kyc_status: user.kyc_status,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
