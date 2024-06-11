import { config as conf } from "dotenv";

conf();

const _config = {
  port: process.env.PORT,
  databaseUrl: process.env.MONGO_CONNECTION_STRING,
  env: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET,
  cloudinaryCloud: process.env.CLOUDNARY_CLOUD,
  cloudinaryApiKey: process.env.CLOUDNARY_API_KEY,
  cloudinarySecretKey: process.env.CLOUDNARY_API_SECRET,
};
//freeze method mean make read only
export const config = Object.freeze(_config);
