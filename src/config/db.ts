import mongoose from "mongoose";
import { config } from "./config";
const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoUrl);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`MongoDB connection failed: ${error.message}`);
    }
    process.exit(1);
  }
};

export default connectDB;
