import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let projects;
    if (userId) {
      // Get user's projects (all statuses)
      projects = await sql`
        SELECT * FROM projects 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;
    } else {
      // Public: only show approved projects
      projects = await sql`
        SELECT p.*, u.name as user_name
        FROM projects p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.approval_status = 'approved' AND p.status = 'open'
        ORDER BY p.created_at DESC
      `;
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, description, budget_min, budget_max, deadline, category } = body;

    if (!userId || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO projects (user_id, title, description, budget_min, budget_max, deadline, category, status, approval_status, created_at)
      VALUES (${userId}, ${title}, ${description}, ${budget_min}, ${budget_max}, ${deadline}, ${category}, 'pending', 'pending_approval', NOW())
      RETURNING *
    `;

    return NextResponse.json({ project: result[0], message: 'Project submitted for approval' });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
