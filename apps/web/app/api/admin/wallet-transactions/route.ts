import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');

    let transactions;

    let query = `
      SELECT 
        wt.id,
        wt.user_id,
        wt.type,
        wt.amount,
        wt.description,
        wt.related_type,
        wt.related_id,
        wt.created_at,
        u.name as user_name,
        u.email as user_email
      FROM wallet_transactions wt
      JOIN users u ON wt.user_id = u.id
      WHERE 1=1
    `;

    if (type && type !== 'all') {
      query += ` AND wt.type = '${type}'`;
    }

    if (userId) {
      query += ` AND wt.user_id = ${userId}`;
    }

    query += ` ORDER BY wt.created_at DESC LIMIT 100`;

    transactions = await sql(query);

    return NextResponse.json({ transactions });
  } catch (error: any) {
    console.error('Error fetching wallet transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet transactions' },
      { status: 500 }
    );
  }
}
