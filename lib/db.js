import { MongoClient } from "mongodb";

// Returns the database, or null if MONGODB_URI is missing/unreachable (app still works without it).
export async function getDb() {
  if (!process.env.MONGODB_URI) return null;
  try {
    if (!global._krishiMongo) global._krishiMongo = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 }).connect();
    return (await global._krishiMongo).db("krishi");
  } catch (e) {
    global._krishiMongo = null;
    return null;
  }
}
