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

interface RequestData {
  userId: string;
  astrologerId: string;
  roomId: string;
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

    const { userId, astrologerId, roomId }: RequestData = await request.json();
    const client = await clientPromise;
    const db = client.db('astrology');

    // Verify the user has permission to access this chat
    const chat = await db.collection('chats').findOne({
      roomId,
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

    const messages = await db
      .collection('messages')
      .find({
        roomId,
        $or: [
          { 'sender.id': new ObjectId(userId), 'receiver.id': new ObjectId(astrologerId) },
          { 'sender.id': new ObjectId(astrologerId), 'receiver.id': new ObjectId(userId) }
        ]
      })
      .sort({ timestamp: 1 })
      .toArray();

    // Mark messages as read
    if (messages.length > 0) {
      await db.collection('messages').updateMany(
        {
          roomId,
          'receiver.id': new ObjectId(session.user.id),
          isRead: { $ne: true }
        },
        { $set: { isRead: true } }
      );
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
} 