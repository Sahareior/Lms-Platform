import mongoose from "mongoose";

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';

export const connectDB = async () => {
  try {
    await mongoose.connect(url)
    console.log('MongoDB connected successfully');
  }
  catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}