import mongoose from "mongoose";
import { config } from "./config";
import { error } from "console";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Connected to db successfully");
    });
    mongoose.connection.on("error", () => {
      console.log("Error in Connecting to database ", error);
    });
    await mongoose.connect(config.databaseUrl as string);
  } catch (error) {
    console.error("Failed to connect to database.");
    process.exit(1);
  } 
};

export default connectDB;
