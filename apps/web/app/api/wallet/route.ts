import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create wallet for user
    let wallet = await sql`
      SELECT * FROM wallets WHERE user_id = ${parseInt(userId)}
    `;

    if (wallet.length === 0) {
      // Create wallet if doesn't exist
      wallet = await sql`
        INSERT INTO wallets (user_id, balance, held_balance)
        VALUES (${parseInt(userId)}, 0, 0)
        RETURNING *
      `;
    }

    return NextResponse.json(wallet[0]);
  } catch (error: any) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch wallet' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, amount } = body;

    if (!action || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get or create wallet
    let wallet = await sql`
      SELECT * FROM wallets WHERE user_id = ${parseInt(userId)}
    `;

    if (wallet.length === 0) {
      wallet = await sql`
        INSERT INTO wallets (user_id, balance, held_balance)
        VALUES (${parseInt(userId)}, 0, 0)
        RETURNING *
      `;
    }

    const currentWallet = wallet[0];

    if (action === 'deposit') {
      // Add funds to balance
      const updatedWallet = await sql`
        UPDATE wallets
        SET balance = balance + ${amount}, updated_at = NOW()
        WHERE user_id = ${parseInt(userId)}
        RETURNING *
      `;

      // Record transaction
      await sql`
        INSERT INTO wallet_transactions (user_id, type, amount, description)
        VALUES (
          ${parseInt(userId)},
          'deposit',
          ${amount},
          ${`Deposited $${amount} to wallet`}
        )
      `;

      return NextResponse.json({ 
        success: true, 
        wallet: updatedWallet[0],
        message: 'Deposit successful'
      });
    }

    if (action === 'withdraw') {
      // Check sufficient balance
      if (parseFloat(currentWallet.balance) < amount) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
      }

      // Deduct from balance
      const updatedWallet = await sql`
        UPDATE wallets
        SET balance = balance - ${amount}, updated_at = NOW()
        WHERE user_id = ${parseInt(userId)}
        RETURNING *
      `;

      // Record transaction
      await sql`
        INSERT INTO wallet_transactions (user_id, type, amount, description)
        VALUES (
          ${parseInt(userId)},
          'withdraw',
          ${amount},
          ${`Withdrew $${amount} from wallet`}
        )
      `;

      return NextResponse.json({ 
        success: true, 
        wallet: updatedWallet[0],
        message: 'Withdrawal successful'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Wallet operation error:', error);
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 500 });
  }
}
