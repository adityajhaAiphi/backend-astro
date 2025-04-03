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

interface MessageRequest {
  chatId: string;
  message: string;
  userId: string;
}

export async function POST(request: Request) {
  try {
    // Validate session
    const session = await getServerSession(authOptions) as CustomSession;
    if (!session?.user || session.user.role !== 'astrologer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const { chatId, message, userId }: MessageRequest = await request.json();
    
    if (!chatId || !message || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`Sending message from astrologer ${session.user.id} to user ${userId} in chat ${chatId}`);

    try {
      const client = await clientPromise;
      const db = client.db('astrology');
      
      // Verify the chat exists and belongs to this astrologer
      const chat = await db.collection('chats').findOne({
        _id: new ObjectId(chatId),
        astrologerId: new ObjectId(session.user.id)
      });

      if (!chat) {
        return NextResponse.json(
          { error: 'Chat not found or not authorized' },
          { status: 404 }
        );
      }

      // Create the new message
      const newMessage = {
        _id: new ObjectId(),
        senderId: new ObjectId(session.user.id),
        message: message.trim(),
        messageType: 'text',
        timestamp: new Date(),
        isRead: false
      };

      // Fix: Properly type the MongoDB update operation
      const updateResult = await db.collection('chats').updateOne(
        { _id: new ObjectId(chatId) },
        { 
          $push: { messages: newMessage } as any,
          $set: { lastMessage: message.trim() }
        }
      );

      return NextResponse.json({
        success: true,
        messageId: newMessage._id.toString(),
        timestamp: newMessage.timestamp
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error in send message API route:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
} 