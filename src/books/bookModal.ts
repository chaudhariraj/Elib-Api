import mongoose from "mongoose";
import { Book } from "./bookTypes";

const bookSchema = new mongoose.Schema<Book>(
  {
    title: {
      type: String,
      require: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId, //have to connect two collection with object ID
      require: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    file: {
      type: String,
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } //when it create and for sorting purpose
);

//Create models and mongoose will create users modal plural form and if use add third parameter it will override and create with that name.
export default mongoose.model<Book>("Book", bookSchema);
