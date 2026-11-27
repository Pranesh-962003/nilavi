import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { seedMongoFromLocalData } from "../services/mongoSync.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server/.env regardless of current working directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

let cachedPromise = null;

export const connectdb = async () => {
  // If already connected, reuse existing connection (crucial for Vercel serverless)
  if (mongoose.connection && mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  // If a connection attempt is currently in flight, return the same promise
  if (cachedPromise) {
    return cachedPromise;
  }

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ CRITICAL: No MONGO_URI specified in environment.");
    return null;
  }

  try {
    mongoose.set('strictQuery', false);
    cachedPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      bufferCommands: false
    }).then(async (conn) => {
      console.log("✅ MongoDB Atlas connected successfully.");
      // Seed and sync any initial data to MongoDB asynchronously
      seedMongoFromLocalData().catch((err) => {
        console.warn("⚠️ Initial seed notice:", err.message);
      });
      return conn;
    });

    await cachedPromise;
    return mongoose.connection;
  } catch (error) {
    cachedPromise = null;
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
};

export default connectdb;
