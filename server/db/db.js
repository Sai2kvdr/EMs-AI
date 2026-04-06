import mongoose from "mongoose";

const connecttoDatabase = async () => {
  try {
    console.log(process.env.MONGODB_URI, "Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: false, 
    });
    console.log("Connected to MongoDB successfully");
  } catch (err) {
    console.log("Error connecting to database:", err);
  }
};

export default connecttoDatabase;
