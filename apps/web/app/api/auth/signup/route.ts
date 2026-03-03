import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = await sql`
      INSERT INTO users (email, password, name, role, kyc_status, created_at)
      VALUES (${email}, ${password}, ${name}, 'user', 'not_started', NOW())
      RETURNING id, email, name, role, kyc_status, avatar, bio, language, notifications_enabled, dark_mode
    `;

    if (newUser.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create wallet for the new user
    await sql`
      INSERT INTO wallets (user_id, balance, held_balance, created_at, updated_at)
      VALUES (${newUser[0].id}, 0, 0, NOW(), NOW())
    `;

    return NextResponse.json({
      user: newUser[0],
      message: 'User created successfully'
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
