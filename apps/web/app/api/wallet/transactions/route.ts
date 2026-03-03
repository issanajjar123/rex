import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactions = await sql`
      SELECT * FROM wallet_transactions
      WHERE user_id = ${parseInt(userId)}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error('Transactions fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch transactions' }, { status: 500 });
  }
}
