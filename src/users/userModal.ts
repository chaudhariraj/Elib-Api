import mongoose from "mongoose";
import { User } from "./userTypes";

const userSchema = new mongoose.Schema<User>(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      unique: true, //same email not allowed
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
  },
  { timestamps: true } //when it create and for sorting purpose
);

//Create models and mongoose will create users modal plural form and if use add third parameter it will override and create with that name. 
 export default mongoose.model<User>("User", userSchema);
