import dotenv from "dotenv";
import mongoose from "mongoose";

// Local imports
import logger from "./logger.config";

// Load env variables
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGODB_URI || "";
export const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Connect to MongoDB atlas
mongoose
  .connect(MONGO_URI)
  .then(() => logger.info(`Database connected successfully -> ${MONGO_URI}`));

// Terminate server on MongoDB error
mongoose.connection.on("error", err => {
  logger.error(`Database connection failed -> ${err.message}`);
  process.exit(1);
});
