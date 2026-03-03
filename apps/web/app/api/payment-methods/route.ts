import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const methods = await sql`
      SELECT * FROM payment_methods
      WHERE user_id = ${parseInt(userId)}
      ORDER BY is_default DESC, created_at DESC
    `;

    return NextResponse.json(methods);
  } catch (error: any) {
    console.error('Payment methods fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch payment methods' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      method_type,
      provider,
      account_holder_name,
      account_number,
      bank_name,
      iban,
      swift_code,
      paypal_email,
      is_default
    } = body;

    if (!method_type || !account_holder_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // If setting as default, unset other defaults
    if (is_default) {
      await sql`
        UPDATE payment_methods
        SET is_default = false
        WHERE user_id = ${parseInt(userId)}
      `;
    }

    const newMethod = await sql`
      INSERT INTO payment_methods (
        user_id,
        method_type,
        provider,
        account_holder_name,
        account_number,
        bank_name,
        iban,
        swift_code,
        paypal_email,
        is_default
      ) VALUES (
        ${parseInt(userId)},
        ${method_type},
        ${provider || null},
        ${account_holder_name},
        ${account_number || null},
        ${bank_name || null},
        ${iban || null},
        ${swift_code || null},
        ${paypal_email || null},
        ${is_default || false}
      )
      RETURNING *
    `;

    return NextResponse.json(newMethod[0]);
  } catch (error: any) {
    console.error('Add payment method error:', error);
    return NextResponse.json({ error: error.message || 'Failed to add payment method' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const url = new URL(request.url);
    const methodId = url.searchParams.get('id');
    
    if (!userId || !methodId) {
      return NextResponse.json({ error: 'Unauthorized or invalid request' }, { status: 401 });
    }

    await sql`
      DELETE FROM payment_methods
      WHERE id = ${parseInt(methodId)} AND user_id = ${parseInt(userId)}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete payment method error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete payment method' }, { status: 500 });
  }
}
