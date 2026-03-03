import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    const offers = await sql`
      SELECT 
        o.*,
        u.name as user_name,
        u.avatar as user_avatar
      FROM offers o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `;

    return NextResponse.json({ success: true, offers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch offers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, title, description, price, category } = body;

    if (!user_id || !title || !description || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    
    const [offer] = await sql`
      INSERT INTO offers (user_id, title, description, price, category, status, created_at)
      VALUES (${user_id}, ${title}, ${description}, ${price}, ${category || 'other'}, 'active', NOW())
      RETURNING *
    `;

    return NextResponse.json(offer);
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
  }
}
