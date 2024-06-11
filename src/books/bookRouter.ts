import express from "express";
import createBook from "./bookController";
import multer from "multer";
import path from "node:path";

const bookRouter = express.Router();

//file store local
const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/uploads"),
  //todo add limit to multer user can't upload more then 10mb file. (put limit 10mb max.)
  limits: { fieldSize: 3e7 }, //30Mb=> 30*1024*1024
});

//routes
bookRouter.post(
  "/",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createBook
);

export default bookRouter;
