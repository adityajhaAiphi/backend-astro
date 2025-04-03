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

    console.log('Fetching users for astrologer:', session.user.id);

    // Try to connect to MongoDB directly
    try {
      const client = await clientPromise;
      const db = client.db('astrology');
      
      // Fetch only regular users (not astrologers, admins, or superadmins)
      const users = await db.collection('users')
        .find({
          role: 'user',
          _id: { $ne: new ObjectId(session.user.id) }  // Exclude the current astrologer
        })
        .project({
          _id: 1,
          name: 1,
          email: 1,
          profilePicture: 1,
          createdAt: 1
        })
        .sort({ createdAt: -1 })  // Newest users first
        .toArray();

      console.log(`Found ${users.length} users via MongoDB`);
      return NextResponse.json(users);
    } catch (dbError) {
      console.error('MongoDB direct connection error:', dbError);
      // Fall through to backend API
    }

    // Forward to backend API as fallback
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    const response = await fetch(`${backendUrl}/api/astrologers/users`, {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN || ''}`,
        'Content-Type': 'application/json',
        'X-User-ID': session.user.id,
        'X-User-Role': session.user.role
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', response.status, errorText);
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Found ${data.length} users via backend API`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Return empty array as fallback to prevent UI errors
    return NextResponse.json([], { status: 200 });
  }
} 