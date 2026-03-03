import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });
    }

    // Get payment methods
    const methods = await sql`
      SELECT * FROM payment_methods 
      WHERE user_id = ${userId}
      ORDER BY is_default DESC
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
    // Payment processing would go here
    return NextResponse.json({ message: 'تمت المعالجة بنجاح' });
  } catch (error) {
    console.error('خطأ في الدفع:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
