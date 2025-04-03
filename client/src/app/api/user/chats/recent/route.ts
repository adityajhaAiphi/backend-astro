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
    // Validate session
    const session = await getServerSession(authOptions) as CustomSession;
    if (!session?.user || session.user.role !== 'user') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      const client = await clientPromise;
      const db = client.db('astrology');
      
      // Find recent chats for this user, limit to 5
      const chats = await db.collection('chats')
        .find({
          userId: new ObjectId(session.user.id)
        })
        .sort({ updatedAt: -1 })
        .limit(5)
        .toArray();

      // For each chat, get the astrologer information
      const recentChats = await Promise.all(
        chats.map(async (chat) => {
          try {
            const astrologer = await db.collection('astrologers').findOne(
              { _id: chat.astrologerId },
              { projection: { name: 1, profileImage: 1 } }
            );

            return {
              _id: chat._id.toString(),
              roomId: chat.roomId,
              astrologerId: chat.astrologerId.toString(),
              astrologerName: astrologer?.name || 'Unknown Astrologer',
              astrologerImage: astrologer?.profileImage || null,
              lastMessage: chat.lastMessage || '',
              timestamp: chat.updatedAt || chat.startTime || new Date(),
              status: chat.status || 'active'
            };
          } catch (error) {
            console.error('Error processing chat:', error);
            return {
              _id: chat._id.toString(),
              roomId: chat.roomId || '',
              astrologerId: chat.astrologerId.toString(),
              astrologerName: 'Unknown Astrologer',
              astrologerImage: null,
              lastMessage: chat.lastMessage || '',
              timestamp: chat.updatedAt || chat.startTime || new Date(),
              status: chat.status || 'active'
            };
          }
        })
      );

      return NextResponse.json(recentChats);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error in recent chats API route:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
} 