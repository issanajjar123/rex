import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    const projects = await sql`
      SELECT 
        p.*,
        u.name as user_name,
        u.avatar as user_avatar
      FROM projects p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `;

    // Format projects data for frontend
    const formattedProjects = projects.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      budget: p.budget_max || p.budget_min || 0,
      duration: p.deadline ? `${Math.ceil((new Date(p.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} يوم` : 'غير محدد',
      status: p.status,
      proposals: 0, // TODO: count from job_applications or create proposal table
      progress: 0,
      skills: [],
      ownerId: p.user_id,
      budget_min: p.budget_min,
      budget_max: p.budget_max,
      deadline: p.deadline,
      category: p.category,
      created_at: p.created_at
    }));

    return NextResponse.json({ success: true, projects: formattedProjects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, title, description, budget_min, budget_max, deadline, category } = body;

    if (!user_id || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    
    const [project] = await sql`
      INSERT INTO projects (user_id, title, description, budget_min, budget_max, deadline, category, status, created_at)
      VALUES (${user_id}, ${title}, ${description}, ${budget_min || 0}, ${budget_max || 0}, ${deadline || null}, ${category || 'other'}, 'open', NOW())
      RETURNING *
    `;

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
