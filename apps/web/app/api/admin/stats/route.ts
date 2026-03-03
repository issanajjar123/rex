import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    // إحصائيات المستخدمين
    const totalUsers = await sql`SELECT COUNT(*) as count FROM users`;
    const newUsersToday = await sql`
      SELECT COUNT(*) as count FROM users 
      WHERE DATE(created_at) = CURRENT_DATE
    `;
    const verifiedUsers = await sql`
      SELECT COUNT(*) as count FROM users 
      WHERE kyc_status = 'verified'
    `;

    // إحصائيات الوظائف
    const totalJobs = await sql`SELECT COUNT(*) as count FROM jobs`;
    const activeJobs = await sql`
      SELECT COUNT(*) as count FROM jobs 
      WHERE status = 'active'
    `;

    // إحصائيات المشاريع
    const totalProjects = await sql`SELECT COUNT(*) as count FROM projects`;
    const activeProjects = await sql`
      SELECT COUNT(*) as count FROM projects 
      WHERE status = 'active'
    `;

    // إحصائيات العروض
    const totalOffers = await sql`SELECT COUNT(*) as count FROM offers`;
    const activeOffers = await sql`
      SELECT COUNT(*) as count FROM offers 
      WHERE status = 'active'
    `;

    // إحصائيات المحفظة
    const totalBalance = await sql`
      SELECT COALESCE(SUM(balance), 0) as total FROM wallets
    `;
    const totalHeld = await sql`
      SELECT COALESCE(SUM(held_balance), 0) as total FROM wallets
    `;

    // إحصائيات Escrow
    const activeEscrow = await sql`
      SELECT COUNT(*) as count FROM escrow_transactions 
      WHERE status = 'held'
    `;
    const totalCommission = await sql`
      SELECT COALESCE(SUM(commission), 0) as total 
      FROM escrow_transactions 
      WHERE status = 'released'
    `;

    // طلبات KYC المعلقة
    const pendingKyc = await sql`
      SELECT COUNT(*) as count FROM kyc_verifications 
      WHERE status = 'pending'
    `;

    // طلبات السحب المعلقة
    const pendingWithdrawals = await sql`
      SELECT COUNT(*) as count FROM withdrawal_requests 
      WHERE status = 'pending'
    `;

    // آخر المعاملات
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

    // آخر المستخدمين
    const recentUsers = await sql`
      SELECT id, name, email, role, kyc_status, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 10
    `;

    return NextResponse.json({
      users: {
        total: parseInt(totalUsers[0].count),
        newToday: parseInt(newUsersToday[0].count),
        verified: parseInt(verifiedUsers[0].count),
      },
      jobs: {
        total: parseInt(totalJobs[0].count),
        active: parseInt(activeJobs[0].count),
      },
      projects: {
        total: parseInt(totalProjects[0].count),
        active: parseInt(activeProjects[0].count),
      },
      offers: {
        total: parseInt(totalOffers[0].count),
        active: parseInt(activeOffers[0].count),
      },
      wallet: {
        totalBalance: parseFloat(totalBalance[0].total),
        totalHeld: parseFloat(totalHeld[0].total),
      },
      escrow: {
        active: parseInt(activeEscrow[0].count),
        totalCommission: parseFloat(totalCommission[0].total),
      },
      pending: {
        kyc: parseInt(pendingKyc[0].count),
        withdrawals: parseInt(pendingWithdrawals[0].count),
      },
      recentTransactions,
      recentUsers,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الإحصائيات' },
      { status: 500 }
    );
  }
}
