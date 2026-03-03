import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const admin = searchParams.get('admin');

    if (admin === 'true') {
      // Get all verifications with user info for admin
      const verifications = await sql`
        SELECT 
          kv.*,
          u.name as user_name,
          u.email as user_email
        FROM kyc_verifications kv
        LEFT JOIN users u ON kv.user_id = u.id
        ORDER BY 
          CASE kv.status 
            WHEN 'pending' THEN 1
            WHEN 'approved' THEN 2
            WHEN 'rejected' THEN 3
          END,
          kv.created_at DESC
      `;
      
      return NextResponse.json({ verifications });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const verification = await sql`
      SELECT * FROM kyc_verifications 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    return NextResponse.json({ verification: verification[0] || null });
  } catch (error) {
    console.error('KYC GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch verifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      idFrontUrl, 
      idBackUrl, 
      selfieUrl, 
      fullName, 
      idNumber, 
      dateOfBirth, 
      address 
    } = body;

    if (!userId || !idFrontUrl || !idBackUrl || !selfieUrl || !fullName || !idNumber || !dateOfBirth || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already has a pending or approved verification
    const existing = await sql`
      SELECT id, status FROM kyc_verifications 
      WHERE user_id = ${userId} 
      AND status IN ('pending', 'approved')
      LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json({ 
        error: existing[0].status === 'approved' 
          ? 'Already verified' 
          : 'Verification already pending' 
      }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO kyc_verifications (
        user_id, id_front_url, id_back_url, selfie_url,
        full_name, id_number, date_of_birth, address, status
      ) VALUES (
        ${userId}, ${idFrontUrl}, ${idBackUrl}, ${selfieUrl},
        ${fullName}, ${idNumber}, ${dateOfBirth}, ${address}, 'pending'
      )
      RETURNING *
    `;

    // Update user KYC status
    await sql`
      UPDATE users 
      SET kyc_status = 'pending' 
      WHERE id = ${userId}
    `;

    return NextResponse.json({ verification: result[0] });
  } catch (error) {
    console.error('KYC POST error:', error);
    return NextResponse.json({ error: 'Failed to submit verification' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { verificationId, status, rejectionReason, reviewerId } = body;

    if (!verificationId || !status || !reviewerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Get verification to update user
    const verification = await sql`
      SELECT user_id FROM kyc_verifications WHERE id = ${verificationId}
    `;

    if (verification.length === 0) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
    }

    const userId = verification[0].user_id;

    // Update verification
    await sql`
      UPDATE kyc_verifications 
      SET 
        status = ${status},
        rejection_reason = ${rejectionReason || null},
        reviewed_by = ${reviewerId},
        reviewed_at = NOW()
      WHERE id = ${verificationId}
    `;

    // Update user KYC status
    await sql`
      UPDATE users 
      SET kyc_status = ${status} 
      WHERE id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('KYC PUT error:', error);
    return NextResponse.json({ error: 'Failed to update verification' }, { status: 500 });
  }
}
