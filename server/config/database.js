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

export const connectdb = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ CRITICAL: No MONGO_URI specified in server/.env.");
    return;
  }
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri);
    console.log("✅ MongoDB Atlas connected successfully to:", uri);
    // Seed and sync any initial data to MongoDB
    await seedMongoFromLocalData();
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
  }
};

export default connectdb;
