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

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions) as CustomSession;

    if (!session?.user || session.user.role !== 'astrologer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get chat ID from query parameter
    const url = new URL(request.url);
    const chatId = url.searchParams.get('id');

    if (!chatId) {
      return NextResponse.json(
        { error: 'Missing chat ID' },
        { status: 400 }
      );
    }

    console.log('Fetching chat:', chatId, 'for astrologer:', session.user.id);

    try {
      const client = await clientPromise;
      const db = client.db('astrology');
      
      // Check if the chat exists and belongs to this astrologer
      const chat = await db.collection('chats').findOne({
        _id: new ObjectId(chatId),
        astrologerId: new ObjectId(session.user.id)
      });

      if (!chat) {
        console.log('Chat not found or does not belong to astrologer');
        return NextResponse.json(
          { error: 'Chat not found' },
          { status: 404 }
        );
      }

      // Get simplified user data for the chat
      const userData = await db.collection('users').findOne(
        { _id: chat.userId },
        { projection: { name: 1, profileImage: 1 } }
      );

      // Format the response
      const formattedChat = {
        _id: chat._id.toString(),
        roomId: chat.roomId || `${session.user.id}_${chat.userId}`,
        userId: {
          _id: chat.userId.toString(),
          name: userData?.name || 'Unknown User',
          profileImage: userData?.profileImage || null
        },
        lastMessage: chat.lastMessage || 'No messages',
        startTime: chat.startTime || new Date(),
        status: chat.status || 'active',
        messages: chat.messages || []
      };

      return NextResponse.json(formattedChat);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error in chat API route:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
} 