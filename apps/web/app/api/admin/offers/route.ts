import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';

    let offers;

    if (status && category) {
      offers = await sql`
        SELECT 
          o.*,
          u.name as user_name,
          u.email as user_email
        FROM offers o
        JOIN users u ON o.user_id = u.id
        WHERE o.status = ${status} AND o.category = ${category}
        ORDER BY o.created_at DESC
      `;
    } else if (status) {
      offers = await sql`
        SELECT 
          o.*,
          u.name as user_name,
          u.email as user_email
        FROM offers o
        JOIN users u ON o.user_id = u.id
        WHERE o.status = ${status}
        ORDER BY o.created_at DESC
      `;
    } else if (category) {
      offers = await sql`
        SELECT 
          o.*,
          u.name as user_name,
          u.email as user_email
        FROM offers o
        JOIN users u ON o.user_id = u.id
        WHERE o.category = ${category}
        ORDER BY o.created_at DESC
      `;
    } else {
      offers = await sql`
        SELECT 
          o.*,
          u.name as user_name,
          u.email as user_email
        FROM offers o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `;
    }

    return NextResponse.json({ offers });
  } catch (error) {
    console.error('Get offers error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب العروض' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offerId = searchParams.get('offerId');

    if (!offerId) {
      return NextResponse.json(
        { error: 'معرف العرض مطلوب' },
        { status: 400 }
      );
    }

    await sql`DELETE FROM offers WHERE id = ${offerId}`;

    return NextResponse.json({ success: true, message: 'تم حذف العرض بنجاح' });
  } catch (error) {
    console.error('Delete offer error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف العرض' },
      { status: 500 }
    );
  }
}
