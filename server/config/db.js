import mongoose from "mongoose";
const connectDB = async () => {
  try {

    mongoose.connection.once("open", () => {
      console.log("DATABASE:", mongoose.connection.name);
    });

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected ✅");

  } catch (error) {
    console.error("DB Error:", error);
    process.exit(1);
  }
};

export default connectDB;