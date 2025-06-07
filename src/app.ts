import path from "path";

// Third-party imports
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import fileUpload from "express-fileupload";

// Local imports
import { MONGO_URI, PORT } from "./config/config";
import studentRoutes from "./routes/studentRoutes";

// Create express app
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// Static file serving
const uploadPath = path.resolve(__dirname, "../uploads");
app.use("/uploads", express.static(uploadPath));
console.log("Upload directory path:", uploadPath);

// HTTP request logger middlewareAdd commentMore actions
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Secure express apps with various HTTP headers
app.use(helmet());

// Parse JSON request body
app.use(express.json());

// Parse JSON request url
app.use(express.urlencoded({ extended: true }));

// Sanitize user-supplied data to prevent MongoDB operator injection
app.use(mongoSanitize());

// Enable cookie parser
app.use(cookieParser());

// Node.js compression middleware
app.use(compression());

// Setup CORS
app.use(cors());

// Simple express file upload middleware that wraps around `Busboy`
app.use(fileUpload({ useTempFiles: true }));

// Mount routes
app.use("/api/students", studentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
      message: err.message || "Something went wrong!",
      error: process.env.NODE_ENV === "development" ? err : {},
    });
  }
);

// Start the dev serverAdd commentMore actions
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
