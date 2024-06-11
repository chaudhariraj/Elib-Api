// import { NextFunction, Request, Response } from "express";
// import cloudinary from "../config/cloudinary ";
// import path from "node:path";

// const createBook = async (req: Request, res: Response, next: NextFunction) => {
//   console.log("files", req.files);
//   const files = req.files as { [fieldname: string]: Express.Multer.File[] };
//   const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
//   const fileName = files.coverImage[0].filename;
//   const filePath = path.resolve(__dirname, "../../public/data/upload", fileName);  //it will generate exact absolute path

//   const uploadResult = await cloudinary.uploader.upload(filePath, {
//     filename_override: fileName,
//     folder: "book-covers",
//     format: coverImageMimeType,
//   });
//   console.log("uploadResult", uploadResult);

//   res.json({ message: "Book" });
// };

// export default createBook;

import { NextFunction, Request, Response } from "express";
import path from "node:path";
import cloudinary from "../config/cloudinary ";
import createHttpError from "http-errors";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("files", req.files);
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!files.coverImage || files.coverImage.length === 0) {
      throw new Error("Cover image file is required.");
    }

    const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    const fileName = files.coverImage[0].filename;
    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      fileName
    ); //it will generate exact absolute path

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: "book-covers",
      format: coverImageMimeType,
    });

    const bookFileName = files.file[0].filename;
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      bookFileName
    ); //it will generate exact absolute path
    //upload pdf
    const bookFileUploadResult = await cloudinary.uploader.upload(
      bookFilePath,
      {
        resource_type: "raw", // for pdf only
        filename_override: bookFileName,
        folder: "book-pdfs",
        format: "pdf",
      }
    );
    console.log("bookFileUploadResult", bookFileUploadResult);
    console.log("uploadResult", uploadResult);
    res.json({ message: "Book created successfully", data: uploadResult });
  } catch (err) {
    console.log("Error uploading file:", err);
    return next(createHttpError(500, "Error while uploading the files"));
  }
};

export default createBook;
