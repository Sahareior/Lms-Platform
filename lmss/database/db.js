import mongoose from "mongoose";

// const url = 'mongodb://localhost:27017/'
// 
const url = 'mongodb+srv://sahareior05_db_user:zB5jBg8fMONIRBNk@cluster0.wdvuyby.mongodb.net/?appName=Cluster0';
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

// zB5jBg8fMONIRBNk sahareior05_db_user