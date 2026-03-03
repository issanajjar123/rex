import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';

    let projects;

    if (status && category) {
      projects = await sql`
        SELECT 
          p.*,
          u.name as user_name,
          u.email as user_email
        FROM projects p
        JOIN users u ON p.user_id = u.id
        WHERE p.status = ${status} AND p.category = ${category}
        ORDER BY p.created_at DESC
      `;
    } else if (status) {
      projects = await sql`
        SELECT 
          p.*,
          u.name as user_name,
          u.email as user_email
        FROM projects p
        JOIN users u ON p.user_id = u.id
        WHERE p.status = ${status}
        ORDER BY p.created_at DESC
      `;
    } else if (category) {
      projects = await sql`
        SELECT 
          p.*,
          u.name as user_name,
          u.email as user_email
        FROM projects p
        JOIN users u ON p.user_id = u.id
        WHERE p.category = ${category}
        ORDER BY p.created_at DESC
      `;
    } else {
      projects = await sql`
        SELECT 
          p.*,
          u.name as user_name,
          u.email as user_email
        FROM projects p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
      `;
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب المشاريع' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'معرف المشروع مطلوب' },
        { status: 400 }
      );
    }

    await sql`DELETE FROM projects WHERE id = ${projectId}`;

    return NextResponse.json({ success: true, message: 'تم حذف المشروع بنجاح' });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف المشروع' },
      { status: 500 }
    );
  }
}
