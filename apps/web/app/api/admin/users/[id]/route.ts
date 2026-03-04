'use server';

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await sql('SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL', [params.id]);
    
    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminId = request.headers.get('x-admin-id');
    const body = await request.json();
    const { action, value } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action required' }, { status: 400 });
    }

    const targetUser = await sql('SELECT * FROM users WHERE id = $1', [params.id]);
    if (!targetUser.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let updateQuery = '';
    let description = '';
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

    // Ban user
    if (action === 'ban') {
      if (targetUser[0].role === 'admin') {
        return NextResponse.json({ error: 'Cannot ban admin user' }, { status: 403 });
      }
      await sql('UPDATE users SET status = $1 WHERE id = $2', ['banned', params.id]);
      description = `User banned`;
    }

    // Unban user
    else if (action === 'unban') {
      await sql('UPDATE users SET status = $1 WHERE id = $2', ['active', params.id]);
      description = `User unbanned`;
    }

    // Change role
    else if (action === 'change_role') {
      const { role } = body;
      if (!['user', 'freelancer', 'admin'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      await sql('UPDATE users SET role = $1 WHERE id = $2', [role, params.id]);
      description = `Role changed to ${role}`;
    }

    // Log the action
    if (adminId) {
      await sql(
        'INSERT INTO audit_logs (admin_id, action, target_user_id, description, ip_address) VALUES ($1, $2, $3, $4, $5)',
        [adminId, action, params.id, description, ipAddress]
      );
    }

    return NextResponse.json({ message: 'User updated successfully', action });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminId = request.headers.get('x-admin-id');
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

    const targetUser = await sql('SELECT * FROM users WHERE id = $1', [params.id]);
    if (!targetUser.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Soft delete
    await sql('UPDATE users SET deleted_at = NOW() WHERE id = $1', [params.id]);

    // Log the action
    if (adminId) {
      await sql(
        'INSERT INTO audit_logs (admin_id, action, target_user_id, description, ip_address) VALUES ($1, $2, $3, $4, $5)',
        [adminId, 'soft_delete', params.id, 'User account soft deleted', ipAddress]
      );
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
