import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

// Helper function to handle CORS
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*", // This can remain as wildcard since we're not using credentials here
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

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
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      const client = await clientPromise;
      const db = client.db('astrology');
      
      // Get available astrologers (online ones could be prioritized)
      const astrologers = await db.collection('astrologers').find({
        // You can add filters here, such as 'status: "online"' 
      }, {
        projection: {
          _id: 1,
          name: 1,
          profileImage: 1,
          bio: 1,
          specialization: 1,
          experience: 1,
          status: 1,
          createdAt: 1
        }
      }).toArray();

      const formattedAstrologers = astrologers.map(astrologer => ({
        _id: astrologer._id.toString(),
        name: astrologer.name,
        profileImage: astrologer.profileImage || null,
        bio: astrologer.bio || '',
        specialization: astrologer.specialization || [],
        experience: astrologer.experience || 0,
        status: astrologer.status || 'offline',
        createdAt: astrologer.createdAt || new Date()
      }));

      return NextResponse.json(formattedAstrologers);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error in astrologers API route:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}