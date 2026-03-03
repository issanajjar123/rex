import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const kyc_status = searchParams.get('kyc_status') || '';
    
    let query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.kyc_status,
        u.avatar,
        u.created_at,
        COALESCE(w.balance, 0) as balance
      FROM users u
      LEFT JOIN wallets w ON u.id = w.user_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCount = 1;
    
    if (search) {
      query += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }
    
    if (role) {
      query += ` AND u.role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }
    
    if (kyc_status) {
      if (kyc_status === 'not_verified') {
        query += ` AND (u.kyc_status IS NULL OR u.kyc_status = 'not_verified')`;
      } else {
        query += ` AND u.kyc_status = $${paramCount}`;
        params.push(kyc_status);
        paramCount++;
      }
    }
    
    query += ` ORDER BY u.created_at DESC`;
    
    const users = await sql(query, params);

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, role } = body;
    
    if (action === 'change_role') {
      await sql`UPDATE users SET role = ${role} WHERE id = ${userId}`;
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Delete user and all related data
    await sql`DELETE FROM messages WHERE sender_id = ${userId}`;
    await sql`DELETE FROM chats WHERE user_id = ${userId} OR other_user_id = ${userId}`;
    await sql`DELETE FROM job_applications WHERE user_id = ${userId}`;
    await sql`DELETE FROM jobs WHERE user_id = ${userId}`;
    await sql`DELETE FROM projects WHERE user_id = ${userId}`;
    await sql`DELETE FROM offers WHERE user_id = ${userId}`;
    await sql`DELETE FROM kyc_verifications WHERE user_id = ${userId}`;
    await sql`DELETE FROM payment_methods WHERE user_id = ${userId}`;
    await sql`DELETE FROM withdrawal_requests WHERE user_id = ${userId}`;
    await sql`DELETE FROM wallet_transactions WHERE user_id = ${userId}`;
    await sql`DELETE FROM wallets WHERE user_id = ${userId}`;
    await sql`DELETE FROM escrow_transactions WHERE buyer_id = ${userId} OR seller_id = ${userId}`;
    await sql`DELETE FROM users WHERE id = ${userId}`;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
