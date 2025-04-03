import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET() {
  // Try to get URI from environment variable first, then fall back to hardcoded URI
  const uri = process.env.MONGO_URI || "mongodb+srv://2005akjha:aditya@cluster0.gxoqohx.mongodb.net/astroalert";
  
  if (!uri) {
    return NextResponse.json(
      { error: "MongoDB URI is not configured" },
      { status: 500 }
    );
  }

  // Mask the connection string for security
  const maskedUri = uri.replace(
    /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/,
    'mongodb$1://$2:****@'
  );
  
  const client = new MongoClient(uri);

  try {
    console.log("Testing MongoDB connection with URI:", maskedUri);
    await client.connect();
    
    // List all databases to verify connection
    const adminDb = client.db("admin");
    const dbs = await adminDb.admin().listDatabases();
    
    // List all collections in the astroalert database
    const astroalertDb = client.db("astroalert");
    const collections = await astroalertDb.listCollections().toArray();
    
    return NextResponse.json({
      success: true,
      message: "MongoDB connection successful",
      databases: dbs.databases.map(db => db.name),
      astroalertCollections: collections.map(col => col.name),
      usingEnvVar: !!process.env.MONGO_URI
    });
  } catch (error) {
    console.error("MongoDB connection test failed:", error);
    
    return NextResponse.json({
      success: false,
      error: "MongoDB connection failed",
      details: error instanceof Error ? error.message : String(error),
      uri: maskedUri, // Safe to include masked URI in error response
      usingEnvVar: !!process.env.MONGO_URI
    }, { status: 500 });
  } finally {
    await client.close();
  }
} 