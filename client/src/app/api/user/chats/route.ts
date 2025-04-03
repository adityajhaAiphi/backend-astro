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

    console.log('Fetching chats for user:', session.user.id);
    
    try {
      const client = await clientPromise;
      const db = client.db('astrology');
      
      // Find all chats where this user is a participant
      const chats = await db.collection('chats').find({
        userId: new ObjectId(session.user.id)
      }).toArray();

      console.log(`Found ${chats.length} chats for user`);

      // For each chat, get the astrologer information
      const chatsWithDetails = await Promise.all(
        chats.map(async (chat) => {
          try {
            const astrologer = await db.collection('astrologers').findOne(
              { _id: chat.astrologerId },
              { projection: { name: 1, profileImage: 1 } }
            );

            // Count unread messages
            const unreadCount = await db.collection('messages').countDocuments({
              roomId: chat.roomId,
              'sender.id': chat.astrologerId,
              'receiver.id': new ObjectId(session.user.id),
              isRead: { $ne: true }
            });

            return {
              _id: chat._id.toString(),
              roomId: chat.roomId,
              astrologerId: {
                _id: chat.astrologerId.toString(),
                name: astrologer?.name || 'Unknown Astrologer',
                profileImage: astrologer?.profileImage || null
              },
              lastMessage: chat.lastMessage || '',
              startTime: chat.startTime || new Date(),
              status: chat.status || 'active',
              unreadCount: unreadCount
            };
          } catch (error) {
            console.error('Error processing chat:', error);
            return {
              _id: chat._id.toString(),
              roomId: chat.roomId || '',
              astrologerId: {
                _id: chat.astrologerId.toString(),
                name: 'Unknown Astrologer',
                profileImage: null
              },
              lastMessage: chat.lastMessage || '',
              startTime: chat.startTime || new Date(),
              status: chat.status || 'active',
              unreadCount: 0
            };
          }
        })
      );

      return NextResponse.json(chatsWithDetails);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error in chats API route:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
} 