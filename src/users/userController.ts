import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import userModal from "./userModal";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  //Validation
  console.log("request body", req.body);
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    const error = createHttpError(400, "All field are required.");
    return next(error);
  }

  //Database call
  const user = await userModal.findOne({ email: email });
  if (user) {
    const error = createHttpError(400, "User already exist with this email");
    return next(error);
  }

  //password hash salt
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await userModal.create({
    name: name,
    email: email,
    password: hashedPassword,
  });
  //Token Generation JWT
  const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
    expiresIn: "7d",
    algorithm: 'HS256',
  });

  //Process or Logic

  //response
  res.json({ accessToken: token });
};

export { createUser };
