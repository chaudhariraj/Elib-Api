import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import userModal from "./userModal";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  //Validation
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    const error = createHttpError(400, "All field are required.");
    return next(error);
  }

  // Check if user already exists
  try {
    const existingUser = await userModal.findOne({ email: email });
    if (existingUser) {
      const error = createHttpError(400, "User already exist with this email");
      return next(error);
    }
  } catch (error) {
    return next(
      createHttpError(
        500,
        "Error while getting user information from the database"
      )
    );
  }

  //password hashing salt
  // Password hashing
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (error) {
    return next(createHttpError(500, "Error while hashing password"));
  }

  // Creating user
  let newUser: User; //newUser accessible outside
  try {
    newUser = await userModal.create({
      name: name,
      email: email,
      password: hashedPassword,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while creating user"));
  }
  //Token Generation JWT
  try {
    //response
    const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
      expiresIn: "7d",
      algorithm: "HS256",
    });

    res.status(201).json({ accessToken: token });
  } catch (error) {
    return next(createHttpError(500, "Error while singing the JWT token"));
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  // Validation
  const { email, password } = req.body;

  if (!email || !password) {
    const error = createHttpError(400, "All fields are required.");
    return next(error);
  }

  try {
    // Check for user existence in the database
    const user = await userModal.findOne({ email: email });

    if (!user) {
      const error = createHttpError(404, "User not found");
      return next(error);
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const error = createHttpError(401, "Username or password incorrect!");
      return next(error);
    }

    // Generate token upon successful authentication
    const token = sign({ sub: user._id }, config.jwtSecret as string, {
      expiresIn: "7d",
      algorithm: "HS256",
    });

    res.status(200).json({ accessToken: token });
  } catch (error) {
    next(createHttpError(500, "Internal Server Error"));
  }
};

export { createUser, loginUser };
