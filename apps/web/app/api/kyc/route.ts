import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const admin = searchParams.get('admin');

    if (admin === 'true') {
      // Admin view - get all KYC requests
      const verifications = await sql`
        SELECT k.*, u.name, u.email
        FROM kyc_verifications k
        JOIN users u ON k.user_id = u.id
        ORDER BY k.created_at DESC
      `;
      return NextResponse.json(verifications);
    }

    if (!userId) {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });
    }

    const verifications = await sql`
      SELECT * FROM kyc_verifications 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    return NextResponse.json(verifications[0] || null);
  } catch (error) {
    console.error('خطأ في جلب التحقق:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      user_id, 
      full_name, 
      id_number, 
      date_of_birth, 
      address,
      id_front_url,
      id_back_url,
      selfie_url
    } = body;

    const verifications = await sql`
      INSERT INTO kyc_verifications (
        user_id, full_name, id_number, date_of_birth, address,
        id_front_url, id_back_url, selfie_url, status
      )
      VALUES (
        ${user_id}, ${full_name}, ${id_number}, ${date_of_birth}, ${address},
        ${id_front_url}, ${id_back_url}, ${selfie_url}, 'pending'
      )
      RETURNING *
    `;

    // Update user KYC status
    await sql`
      UPDATE users
      SET kyc_status = 'pending'
      WHERE id = ${user_id}
    `;

    return NextResponse.json(verifications[0]);
  } catch (error) {
    console.error('خطأ في التحقق:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { kyc_id, status, rejection_reason, reviewed_by } = body;

    await sql`
      UPDATE kyc_verifications
      SET status = ${status}, 
          rejection_reason = ${rejection_reason || null},
          reviewed_by = ${reviewed_by || null},
          reviewed_at = NOW()
      WHERE id = ${kyc_id}
    `;

    // Update user KYC status
    const verifications = await sql`
      SELECT user_id FROM kyc_verifications WHERE id = ${kyc_id}
    `;

    if (verifications.length > 0) {
      await sql`
        UPDATE users
        SET kyc_status = ${status}
        WHERE id = ${verifications[0].user_id}
      `;
    }

    return NextResponse.json({ message: 'تم التحديث بنجاح' });
  } catch (error) {
    console.error('خطأ في تحديث التحقق:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
