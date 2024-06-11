import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandlers";
import useRouter from "./users/userRouter";
import bookRouter from "./books/bookRouter";

const app = express();
//Parse the json
app.use(express.json());

app.get("/", (req, res, next) => {
  // const error = createHttpError(400, "Something went Wrong")
  // throw error;
  res.json({ message: "Welcome back do all the things" });
});

app.use("/api/users", useRouter);
app.use("/api/books", bookRouter);

///Global error handler
app.use(globalErrorHandler);

export default app;
