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

// Helper function to safely convert string to ObjectId
function safeObjectId(id: string): ObjectId {
  try {
    return new ObjectId(id);
  } catch (error) {
    console.error('Invalid ObjectId:', id, error);
    // Return a placeholder ObjectId if conversion fails
    return new ObjectId();
  }
}

export async function GET(request: Request) {
  try {
    console.log('GET request to /api/astrologer/chats started');
    
    // 1. Validate session
    const session = await getServerSession(authOptions) as CustomSession;
    if (!session?.user) {
      console.log('No session or user found');
      return NextResponse.json(
        { error: 'Unauthorized - no session' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'astrologer') {
      console.log('User role is not astrologer:', session.user.role);
      return NextResponse.json(
        { error: 'Unauthorized - not an astrologer' },
        { status: 401 }
      );
    }

    const astrologerId = session.user.id;
    console.log('Fetching chats for astrologer:', astrologerId);
    
    try {
      const client = await clientPromise;
      const db = client.db('astrology');
      
      // First check if astrologerId is valid
      if (!ObjectId.isValid(astrologerId)) {
        console.error('Invalid astrologer ID:', astrologerId);
        return NextResponse.json([], { status: 200 }); // Return empty array instead of error
      }
      
      // Use a simple, reliable query with string ID conversion
      const chats = await db.collection('chats')
        .find({
          astrologerId: new ObjectId(astrologerId),
          status: { $ne: 'cancelled' }
        })
        .sort({ startTime: -1 })
        .toArray();
        
      console.log(`Found ${chats.length} chats for astrologer`);
      
      // Map to expected format with error handling for each chat
      const formattedChats = await Promise.all(
        chats.map(async (chat) => {
          try {
            // Get user details if available
            let user = { _id: 'unknown', name: 'Unknown User', profileImage: null };
            
            if (chat.userId) {
              try {
                const userId = chat.userId.toString();
                const userData = await db.collection('users').findOne({
                  _id: new ObjectId(userId)
                });
                
                if (userData) {
                  user = {
                    _id: userData._id.toString(),
                    name: userData.name || 'Unknown User',
                    profileImage: userData.profilePicture || null
                  };
                }
              } catch (error) {
                console.error('Error fetching user details:', error);
              }
            }
            
            return {
              _id: chat._id.toString(),
              roomId: chat.roomId || `${astrologerId}_${chat.userId}`,
              userId: user,
              lastMessage: chat.lastMessage || 'No messages',
              startTime: chat.startTime || new Date(),
              status: chat.status || 'active'
            };
          } catch (chatError) {
            console.error('Error processing chat:', chatError);
            // Return a minimum valid chat object
            return {
              _id: chat._id.toString(),
              roomId: chat.roomId || '',
              userId: { _id: 'unknown', name: 'Unknown User', profileImage: null },
              lastMessage: 'Error loading chat',
              startTime: new Date(),
              status: 'active'
            };
          }
        })
      );
      
      return NextResponse.json(formattedChats);
    } catch (dbError) {
      console.error('MongoDB connection/query error:', dbError);
      
      // Always return a valid, empty response rather than throwing errors
      return NextResponse.json([], { status: 200 });
    }
  } catch (error) {
    // Detailed error logging for the entire route
    console.error('Unhandled error in chat API route:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    // Always return a valid response to prevent client-side errors
    return NextResponse.json([], { status: 200 });
  }
} 