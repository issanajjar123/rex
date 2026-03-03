import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    // Get total users count
    const usersCount = await sql`SELECT COUNT(*) as total FROM users WHERE role != 'admin'`;
    
    // Get new users today
    const newUsersToday = await sql`
      SELECT COUNT(*) as count FROM users 
      WHERE DATE(created_at) = CURRENT_DATE AND role != 'admin'
    `;
    
    // Get verified users count
    const verifiedUsers = await sql`SELECT COUNT(*) as count FROM users WHERE kyc_status = 'verified'`;
    
    // Get jobs stats
    const jobsStats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'open') as active
      FROM jobs
    `;
    
    // Get projects stats
    const projectsStats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'open') as active
      FROM projects
    `;
    
    // Get offers stats
    const offersStats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active
      FROM offers
    `;
    
    // Get wallet stats
    const walletStats = await sql`
      SELECT 
        COALESCE(SUM(balance), 0) as total_balance,
        COALESCE(SUM(held_balance), 0) as total_held
      FROM wallets
    `;
    
    // Get escrow stats
    const escrowStats = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending' OR status = 'held') as active,
        COALESCE(SUM(commission), 0) as total_commission
      FROM escrow_transactions
    `;
    
    // Get pending KYC count
    const pendingKyc = await sql`SELECT COUNT(*) as count FROM kyc_verifications WHERE status = 'pending'`;
    
    // Get pending withdrawal requests
    const pendingWithdrawals = await sql`SELECT COUNT(*) as count FROM withdrawal_requests WHERE status = 'pending'`;
    
    // Get recent users
    const recentUsers = await sql`
      SELECT id, name, email, role, kyc_status, created_at 
      FROM users 
      WHERE role != 'admin'
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    // Get recent wallet transactions
    const recentTransactions = await sql`
      SELECT 
        wt.id,
        wt.type,
        wt.amount,
        wt.description,
        wt.created_at,
        u.name as user_name,
        u.email as user_email
      FROM wallet_transactions wt
      JOIN users u ON wt.user_id = u.id
      ORDER BY wt.created_at DESC
      LIMIT 10
    `;

    return NextResponse.json({
      users: {
        total: parseInt(usersCount[0].total),
        newToday: parseInt(newUsersToday[0].count),
        verified: parseInt(verifiedUsers[0].count)
      },
      jobs: {
        total: parseInt(jobsStats[0].total),
        active: parseInt(jobsStats[0].active)
      },
      projects: {
        total: parseInt(projectsStats[0].total),
        active: parseInt(projectsStats[0].active)
      },
      offers: {
        total: parseInt(offersStats[0].total),
        active: parseInt(offersStats[0].active)
      },
      wallet: {
        totalBalance: parseFloat(walletStats[0].total_balance),
        totalHeld: parseFloat(walletStats[0].total_held)
      },
      escrow: {
        active: parseInt(escrowStats[0].active),
        totalCommission: parseFloat(escrowStats[0].total_commission)
      },
      pending: {
        kyc: parseInt(pendingKyc[0].count),
        withdrawals: parseInt(pendingWithdrawals[0].count)
      },
      recentUsers,
      recentTransactions
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
