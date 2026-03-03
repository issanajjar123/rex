import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const id = searchParams.get('id');

    if (id) {
      const methods = await sql`
        SELECT * FROM payment_methods WHERE id = ${id}
      `;
      return NextResponse.json(methods[0] || null);
    }

    if (!userId) {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });
    }

    const methods = await sql`
      SELECT * FROM payment_methods 
      WHERE user_id = ${userId}
      ORDER BY is_default DESC, created_at DESC
    `;

    return NextResponse.json(methods);
  } catch (error) {
    console.error('خطأ في جلب طرق الدفع:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
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
    } = body;

    // If this is set as default, unset other defaults
    if (is_default) {
      await sql`
        UPDATE payment_methods
        SET is_default = false
        WHERE user_id = ${user_id}
      `;
    }

    const methods = await sql`
      INSERT INTO payment_methods (
        user_id, method_type, provider, account_holder_name,
        account_number, bank_name, iban, swift_code, paypal_email,
        is_default, is_verified
      )
      VALUES (
        ${user_id}, ${method_type}, ${provider}, ${account_holder_name || null},
        ${account_number || null}, ${bank_name || null}, ${iban || null}, 
        ${swift_code || null}, ${paypal_email || null}, ${is_default || false}, false
      )
      RETURNING *
    `;

    return NextResponse.json(methods[0]);
  } catch (error) {
    console.error('خطأ في إضافة طريقة الدفع:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'معرف الطريقة مطلوب' }, { status: 400 });
    }

    await sql`
      DELETE FROM payment_methods WHERE id = ${id}
    `;

    return NextResponse.json({ message: 'تم الحذف بنجاح' });
  } catch (error) {
    console.error('خطأ في حذف طريقة الدفع:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
