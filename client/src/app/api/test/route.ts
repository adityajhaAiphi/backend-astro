import { NextResponse } from "next/server";

export async function GET() {
  // Hardcoded URI for testing (same as in your other routes)
  const hardcodedUri = "mongodb+srv://2005akjha:aditya@cluster0.gxoqohx.mongodb.net/astroalert";
  
  return NextResponse.json({ 
    message: "API is working", 
    timestamp: new Date().toISOString(),
    env: {
      // Check if environment variables exist (without revealing their values)
      hasMongoDB: !!process.env.MONGO_URI,
      hasHardcodedUri: !!hardcodedUri,
      nodeEnv: process.env.NODE_ENV
    }
  });
} 