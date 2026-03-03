import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let jobs;
    if (userId) {
      // Get user's jobs (all statuses)
      jobs = await sql`
        SELECT * FROM jobs 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;
    } else {
      // Public: only show approved jobs
      jobs = await sql`
        SELECT j.*, u.name as user_name
        FROM jobs j
        LEFT JOIN users u ON j.user_id = u.id
        WHERE j.approval_status = 'approved' AND j.status = 'open'
        ORDER BY j.created_at DESC
      `;
    }

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, description, budget, location, category, salary, job_type, required_skills, work_type } = body;

    if (!userId || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO jobs (
        user_id, title, description, budget, location, category, 
        salary, job_type, required_skills, work_type, 
        status, approval_status, created_at
      )
      VALUES (
        ${userId}, ${title}, ${description}, ${budget}, ${location}, ${category},
        ${salary}, ${job_type}, ${required_skills}, ${work_type},
        'pending', 'pending_approval', NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({ job: result[0], message: 'Job submitted for approval' });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
