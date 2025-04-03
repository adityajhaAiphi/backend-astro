import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface CustomSession {
  user: {
    id: string;
    role: string;
  };
}

interface MessageData {
  content: string;
  roomId: string;
  sessionId: string;
  astrologerId: string;
  userId: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as CustomSession;
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const messageData: MessageData = await request.json();
    const client = await clientPromise;
    const db = client.db('astrology');

    // Verify the user has permission to send this message
    const chat = await db.collection('chats').findOne({
      roomId: messageData.roomId,
      $or: [
        { userId: new ObjectId(session.user.id) },
        { astrologerId: new ObjectId(session.user.id) }
      ]
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found or unauthorized' },
        { status: 403 }
      );
    }

    // Insert user message
    const userMessage = {
      ...messageData,
      timestamp: new Date().toISOString(),
      sender: {
        id: new ObjectId(session.user.id),
        name: session.user.role === 'astrologer' ? 'Astrologer' : 'User',
        role: session.user.role
      },
      receiver: {
        id: new ObjectId(session.user.role === 'astrologer' ? messageData.userId : messageData.astrologerId),
        role: session.user.role === 'astrologer' ? 'user' : 'astrologer'
      }
    };

    await db.collection('messages').insertOne(userMessage);

    // Update chat's last message
    await db.collection('chats').updateOne(
      { roomId: messageData.roomId },
      { $set: { lastMessage: messageData.content } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 