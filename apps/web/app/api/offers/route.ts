import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let offers;
    if (userId) {
      // Get user's offers (all statuses)
      offers = await sql`
        SELECT * FROM offers 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;
    } else {
      // Public: only show approved offers
      offers = await sql`
        SELECT o.*, u.name as user_name
        FROM offers o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.approval_status = 'approved' AND o.status = 'active'
        ORDER BY o.created_at DESC
      `;
    }

    return NextResponse.json({ offers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, description, price, category } = body;

    if (!userId || !title || !description || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO offers (user_id, title, description, price, category, status, approval_status, created_at)
      VALUES (${userId}, ${title}, ${description}, ${price}, ${category}, 'pending', 'pending_approval', NOW())
      RETURNING *
    `;

    return NextResponse.json({ offer: result[0], message: 'Offer submitted for approval' });
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
  }
}
