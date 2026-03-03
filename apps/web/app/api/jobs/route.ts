import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const action = searchParams.get('action');
    const jobId = searchParams.get('job_id');

    if (action === 'applications' && jobId) {
      const applications = await sql`
        SELECT ja.*, u.name as applicant_name, u.avatar, u.email
        FROM job_applications ja
        JOIN users u ON ja.user_id = u.id
        WHERE ja.job_id = ${jobId}
        ORDER BY ja.created_at DESC
      `;
      return NextResponse.json(applications);
    }

    if (action === 'my-applications' && userId) {
      const applications = await sql`
        SELECT ja.*, j.title, j.budget, j.location
        FROM job_applications ja
        JOIN jobs j ON ja.job_id = j.id
        WHERE ja.user_id = ${userId}
        ORDER BY ja.created_at DESC
      `;
      return NextResponse.json(applications);
    }

    if (userId) {
      const jobs = await sql`
        SELECT * FROM jobs 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;
      return NextResponse.json(jobs);
    }

    const jobs = await sql`
      SELECT j.*, u.name as poster_name
      FROM jobs j
      JOIN users u ON j.user_id = u.id
      WHERE j.status = 'open'
      ORDER BY j.created_at DESC
    `;
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('خطأ في جلب الوظائف:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'apply') {
      const { job_id, user_id, cover_letter, cv_url, portfolio_url } = body;
      
      const applications = await sql`
        INSERT INTO job_applications (job_id, user_id, cover_letter, cv_url, portfolio_url, status)
        VALUES (${job_id}, ${user_id}, ${cover_letter}, ${cv_url || null}, ${portfolio_url || null}, 'pending')
        RETURNING *
      `;
      
      return NextResponse.json(applications[0]);
    }

    if (action === 'update-status') {
      const { application_id, status } = body;
      
      const applications = await sql`
        UPDATE job_applications
        SET status = ${status}
        WHERE id = ${application_id}
        RETURNING *
      `;
      
      return NextResponse.json(applications[0]);
    }

    if (action === 'create-escrow') {
      const { application_id, buyer_id, seller_id, amount, commission } = body;
      
      const escrows = await sql`
        INSERT INTO escrow_transactions (buyer_id, seller_id, amount, commission, related_type, related_id, status)
        VALUES (${buyer_id}, ${seller_id}, ${amount}, ${commission}, 'job', ${application_id}, 'pending')
        RETURNING *
      `;

      await sql`
        UPDATE job_applications
        SET escrow_id = ${escrows[0].id}
        WHERE id = ${application_id}
      `;
      
      return NextResponse.json(escrows[0]);
    }

    // Create job
    const { user_id, title, description, budget, location, category, salary, job_type, required_skills, work_type } = body;
    
    const jobs = await sql`
      INSERT INTO jobs (user_id, title, description, budget, location, category, status, salary, job_type, required_skills, work_type)
      VALUES (${user_id}, ${title}, ${description}, ${budget || 0}, ${location}, ${category}, 'open', ${salary || null}, ${job_type || null}, ${required_skills || null}, ${work_type || null})
      RETURNING *
    `;
    
    return NextResponse.json(jobs[0]);
  } catch (error) {
    console.error('خطأ في إنشاء الوظيفة:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { job_id, status } = body;

    const jobs = await sql`
      UPDATE jobs
      SET status = ${status}
      WHERE id = ${job_id}
      RETURNING *
    `;

    return NextResponse.json(jobs[0]);
  } catch (error) {
    console.error('خطأ في تحديث الوظيفة:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
