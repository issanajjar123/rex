import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';

    let jobs;

    if (status && category) {
      jobs = await sql`
        SELECT 
          j.*,
          u.name as user_name,
          u.email as user_email,
          (SELECT COUNT(*) FROM job_applications WHERE job_id = j.id) as applications_count
        FROM jobs j
        JOIN users u ON j.user_id = u.id
        WHERE j.status = ${status} AND j.category = ${category}
        ORDER BY j.created_at DESC
      `;
    } else if (status) {
      jobs = await sql`
        SELECT 
          j.*,
          u.name as user_name,
          u.email as user_email,
          (SELECT COUNT(*) FROM job_applications WHERE job_id = j.id) as applications_count
        FROM jobs j
        JOIN users u ON j.user_id = u.id
        WHERE j.status = ${status}
        ORDER BY j.created_at DESC
      `;
    } else if (category) {
      jobs = await sql`
        SELECT 
          j.*,
          u.name as user_name,
          u.email as user_email,
          (SELECT COUNT(*) FROM job_applications WHERE job_id = j.id) as applications_count
        FROM jobs j
        JOIN users u ON j.user_id = u.id
        WHERE j.category = ${category}
        ORDER BY j.created_at DESC
      `;
    } else {
      jobs = await sql`
        SELECT 
          j.*,
          u.name as user_name,
          u.email as user_email,
          (SELECT COUNT(*) FROM job_applications WHERE job_id = j.id) as applications_count
        FROM jobs j
        JOIN users u ON j.user_id = u.id
        ORDER BY j.created_at DESC
      `;
    }

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Get jobs error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الوظائف' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'معرف الوظيفة مطلوب' },
        { status: 400 }
      );
    }

    await sql`DELETE FROM job_applications WHERE job_id = ${jobId}`;
    await sql`DELETE FROM jobs WHERE id = ${jobId}`;

    return NextResponse.json({ success: true, message: 'تم حذف الوظيفة بنجاح' });
  } catch (error) {
    console.error('Delete job error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف الوظيفة' },
      { status: 500 }
    );
  }
}
