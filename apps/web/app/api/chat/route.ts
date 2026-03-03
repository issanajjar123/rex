import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const chatId = searchParams.get('chatId');

    if (chatId) {
      // Get messages for a chat
      const messages = await sql`
        SELECT m.*, u.name as sender_name, u.avatar
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.chat_id = ${chatId}
        ORDER BY m.created_at ASC
      `;
      return NextResponse.json(messages);
    }

    if (!userId) {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });
    }

    // Get user's chats
    const chats = await sql`
      SELECT c.*, 
             CASE 
               WHEN c.user_id = ${userId} THEN u2.name 
               ELSE u1.name 
             END as other_name,
             CASE 
               WHEN c.user_id = ${userId} THEN u2.avatar 
               ELSE u1.avatar 
             END as other_avatar
      FROM chats c
      JOIN users u1 ON c.user_id = u1.id
      JOIN users u2 ON c.other_user_id = u2.id
      WHERE c.user_id = ${userId} OR c.other_user_id = ${userId}
      ORDER BY c.last_message_time DESC
    `;

    return NextResponse.json(chats);
  } catch (error) {
    console.error('خطأ في جلب المحادثات:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chat_id, sender_id, content, message_type, type, related_id, file_name, file_size } = body;

    // Insert message
    const messages = await sql`
      INSERT INTO messages (chat_id, sender_id, content, message_type, type, related_id, file_name, file_size)
      VALUES (${chat_id}, ${sender_id}, ${content}, ${message_type || 'text'}, ${type || null}, ${related_id || null}, ${file_name || null}, ${file_size || null})
      RETURNING *
    `;

    // Update chat last message
    await sql`
      UPDATE chats
      SET last_message = ${content}, last_message_time = NOW()
      WHERE id = ${chat_id}
    `;

    return NextResponse.json(messages[0]);
  } catch (error) {
    console.error('خطأ في إرسال الرسالة:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
