// // import { NextFunction, Request, Response } from "express";
// // import cloudinary from "../config/cloudinary ";
// // import path from "node:path";

// // const createBook = async (req: Request, res: Response, next: NextFunction) => {
// //   console.log("files", req.files);
// //   const files = req.files as { [fieldname: string]: Express.Multer.File[] };
// //   const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
// //   const fileName = files.coverImage[0].filename;
// //   const filePath = path.resolve(__dirname, "../../public/data/upload", fileName);  //it will generate exact absolute path

// //   const uploadResult = await cloudinary.uploader.upload(filePath, {
// //     filename_override: fileName,
// //     folder: "book-covers",
// //     format: coverImageMimeType,
// //   });
// //   console.log("uploadResult", uploadResult);

// //   res.json({ message: "Book" });
// // };

// // export default createBook;

// import { NextFunction, Request, Response } from "express";
// import path from "node:path";
// import fs from "node:fs";
// import cloudinary from "../config/cloudinary ";
// import createHttpError from "http-errors";
// import bookModal from "./bookModal";

// const createBook = async (req: Request, res: Response, next: NextFunction) => {
//   try {

//     const { title, genre } = req.body;

//     const files = req.files as { [fieldname: string]: Express.Multer.File[] };
//     if (!files.coverImage || files.coverImage.length === 0) {
//       throw new Error("Cover image file is required.");
//     }

//     const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
//     const fileName = files.coverImage[0].filename;
//     const filePath = path.resolve(__dirname, "../../public/data/uploads", fileName); //it will generate exact absolute path

//     const uploadResult = await cloudinary.uploader.upload(filePath, {
//       filename_override: fileName,
//       folder: "book-covers",
//       format: coverImageMimeType,
//     });

//     const bookFileName = files.file[0].filename;
//     const bookFilePath = path.resolve(__dirname, "../../public/data/uploads", bookFileName); //it will generate exact absolute path
//     //upload pdf
//     const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath,
//       {
//         resource_type: "raw", // for pdf only
//         filename_override: bookFileName,
//         folder: "book-pdfs",
//         format: "pdf",
//       }
//     );

//     const newBook = await bookModal.create({
//       title,
//       genre,
//       author: "6640c863634276c34c3459e0",
//       coverImage: uploadResult.secure_url,
//       file: bookFileUploadResult.secure_url,
//     });

//     //Delete temp files //todo error handling wrap in try catch
//     await fs.promises.unlink(filePath);
//     await fs.promises.unlink(bookFileName);

//     res.status(201).json({ id: newBook._id });

//   } catch (err) {
//     console.log("Error uploading file:", err);
//     return next(createHttpError(500, "Error while uploading the files"));
//   }
// };

// export default createBook;

import { NextFunction, Request, Response } from "express";
import path from "node:path";
import fs from "node:fs";
import createHttpError from "http-errors";
import cloudinary from "../config/cloudinary ";
import bookModal from "./bookModal";
import { AuthRequest } from "../middlewares/authenticate";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, genre, description } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const coverImage = files.coverImage[0];
    const coverImageFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      coverImage.filename
    );

    const coverImageUploadResult = await cloudinary.uploader.upload(
      coverImageFilePath,
      {
        filename_override: coverImage.filename,
        folder: "book-covers",
        format: coverImage.mimetype.split("/").pop(),
      }
    );

    const bookFile = files.file[0];
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      bookFile.filename
    );

    const bookFileUploadResult = await cloudinary.uploader.upload(
      bookFilePath,
      {
        resource_type: "raw",
        filename_override: bookFile.filename,
        folder: "book-pdfs",
        format: "pdf",
      }
    );

    const _req = req as AuthRequest;
    const newBook = await bookModal.create({
      title,
      genre,
      description,
      author: _req.userId,
      coverImage: coverImageUploadResult.secure_url,
      file: bookFileUploadResult.secure_url,
    });

    // Clean up the local files todo wrap in try catch
    await fs.promises.unlink(coverImageFilePath);
    await fs.promises.unlink(bookFilePath);

    res.status(201).json({ id: newBook._id });
  } catch (err) {
    console.error("Error uploading file:", err);
    return next(createHttpError(500, "Unexpected error while uploading files"));
  }
};

// const updateBook = async (req: Request, res: Response, next: NextFunction) => {
//   const { title, genre } = req.body;
//   const bookId = req.params.bookId;

//   const book = await bookModal.findOne({ _id: bookId });
//   if (!book) {
//     return next(createHttpError(404, "Book Not Found"));
//   }

//   //Check access
//   const _req = req as AuthRequest;
//   if (book.author.toString() !== _req.userId) {
//     return next(createHttpError(403, "You Can not update others book."));
//   }
// };

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, genre } = req.body;
  const bookId = req.params.bookId;

  const book = await bookModal.findOne({ _id: bookId });

  if (!book) {
    return next(createHttpError(404, "Book not found"));
  }
  // Check access
  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    return next(createHttpError(403, "You can not update others book."));
  }

  // check if image field is exists.

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  let completeCoverImage = "";
  if (files.coverImage) {
    const filename = files.coverImage[0].filename;
    const converMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    // send files to cloudinary
    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads/" + filename
    );
    completeCoverImage = filename;
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: completeCoverImage,
      folder: "book-covers",
      format: converMimeType,
    });

    completeCoverImage = uploadResult.secure_url;
    await fs.promises.unlink(filePath);
  }

  // check if file field is exists.
  let completeFileName = "";
  if (files.file) {
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads/" + files.file[0].filename
    );

    const bookFileName = files.file[0].filename;
    completeFileName = bookFileName;

    const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: "raw",
      filename_override: completeFileName,
      folder: "book-pdfs",
      format: "pdf",
    });

    completeFileName = uploadResultPdf.secure_url;
    await fs.promises.unlink(bookFilePath);
  }

  const updatedBook = await bookModal.findOneAndUpdate(
    {
      _id: bookId,
    },
    {
      title: title,
      description: description,
      genre: genre,
      coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
      file: completeFileName ? completeFileName : book.file,
    },
    { new: true }
  );

  res.json(updatedBook);
};

const listBooks = async (req: Request, res: Response, next: NextFunction) => {
  // const sleep = await new Promise((resolve) => setTimeout(resolve, 5000));

  try {
    // todo: add pagination.
    const book = await bookModal.find().populate("author", "name");
    res.json(book);
  } catch (err) {
    return next(createHttpError(500, "Error while getting a book"));
  }
};

const getSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bookId = req.params.bookId;

  try {
    const book = await bookModal
      .findOne({ _id: bookId })
      // populate author field
      .populate("author", "name");
    if (!book) {
      return next(createHttpError(404, "Book not found."));
    }

    return res.json(book);
  } catch (err) {
    return next(createHttpError(500, "Error while getting a book"));
  }
};

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  const bookId = req.params.bookId;

  const book = await bookModal.findOne({ _id: bookId });
  if (!book) {
    return next(createHttpError(404, "Book not found"));
  }

  // Check Access
  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    return next(createHttpError(403, "You can not update others book."));
  }
  // book-covers/dkzujeho0txi0yrfqjsm
  // https://res.cloudinary.com/degzfrkse/image/upload/v1712590372/book-covers/u4bt9x7sv0r0cg5cuynm.png

  const coverFileSplits = book.coverImage.split("/");
  const coverImagePublicId =
    coverFileSplits.at(-2) + "/" + coverFileSplits.at(-1)?.split(".").at(-2);

  const bookFileSplits = book.file.split("/");
  const bookFilePublicId = bookFileSplits.at(-2) + "/" + bookFileSplits.at(-1);
  console.log("bookFilePublicId", bookFilePublicId);
  // todo: add try error block
  await cloudinary.uploader.destroy(coverImagePublicId);
  await cloudinary.uploader.destroy(bookFilePublicId, {
    resource_type: "raw",
  });

  await bookModal.deleteOne({ _id: bookId });

  return res.sendStatus(204);
};
export { createBook, updateBook, listBooks, getSingleBook, deleteBook };
