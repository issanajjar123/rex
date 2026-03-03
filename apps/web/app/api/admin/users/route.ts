import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const kyc_status = searchParams.get('kyc_status') || '';
    
    // Build the query with filters
    let users;
    
    if (!search && !role && !kyc_status) {
      // No filters - get all users
      users = await sql`
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
        ORDER BY u.created_at DESC
      `;
    } else if (search && !role && !kyc_status) {
      // Only search filter
      const searchPattern = `%${search}%`;
      users = await sql`
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
        WHERE u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern}
        ORDER BY u.created_at DESC
      `;
    } else if (!search && role && !kyc_status) {
      // Only role filter
      users = await sql`
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
        WHERE u.role = ${role}
        ORDER BY u.created_at DESC
      `;
    } else if (!search && !role && kyc_status) {
      // Only kyc_status filter
      if (kyc_status === 'not_verified') {
        users = await sql`
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
          WHERE u.kyc_status IS NULL OR u.kyc_status = 'not_verified'
          ORDER BY u.created_at DESC
        `;
      } else {
        users = await sql`
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
          WHERE u.kyc_status = ${kyc_status}
          ORDER BY u.created_at DESC
        `;
      }
    } else if (search && role && !kyc_status) {
      // Search + role filters
      const searchPattern = `%${search}%`;
      users = await sql`
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
        WHERE (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})
          AND u.role = ${role}
        ORDER BY u.created_at DESC
      `;
    } else if (search && !role && kyc_status) {
      // Search + kyc_status filters
      const searchPattern = `%${search}%`;
      if (kyc_status === 'not_verified') {
        users = await sql`
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
          WHERE (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})
            AND (u.kyc_status IS NULL OR u.kyc_status = 'not_verified')
          ORDER BY u.created_at DESC
        `;
      } else {
        users = await sql`
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
          WHERE (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})
            AND u.kyc_status = ${kyc_status}
          ORDER BY u.created_at DESC
        `;
      }
    } else if (!search && role && kyc_status) {
      // Role + kyc_status filters
      if (kyc_status === 'not_verified') {
        users = await sql`
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
          WHERE u.role = ${role}
            AND (u.kyc_status IS NULL OR u.kyc_status = 'not_verified')
          ORDER BY u.created_at DESC
        `;
      } else {
        users = await sql`
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
          WHERE u.role = ${role}
            AND u.kyc_status = ${kyc_status}
          ORDER BY u.created_at DESC
        `;
      }
    } else {
      // All filters - search + role + kyc_status
      const searchPattern = `%${search}%`;
      if (kyc_status === 'not_verified') {
        users = await sql`
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
          WHERE (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})
            AND u.role = ${role}
            AND (u.kyc_status IS NULL OR u.kyc_status = 'not_verified')
          ORDER BY u.created_at DESC
        `;
      } else {
        users = await sql`
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
          WHERE (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})
            AND u.role = ${role}
            AND u.kyc_status = ${kyc_status}
          ORDER BY u.created_at DESC
        `;
      }
    }

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
