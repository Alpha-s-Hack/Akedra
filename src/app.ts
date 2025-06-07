import path from "path";

// Third-party imports
import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import fileUpload from "express-fileupload";
import createHttpError from "http-errors";

// Local imports
import studentRoutes from "./routes/studentRoutes";

// Configs import
import { PORT } from "./configs/dbConfig";
import logger from "./configs/loggerConfig";

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

// Start the dev server
let server = app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});

// Catch all incoming 404 Not Found errorAdd commentMore actions
app.use(async (req: Request, res: Response, next: NextFunction) => {
  next(
    createHttpError.NotFound(
      "The requested resource could not be found on this server"
    )
  );
});

// Handle HTTP errors
app.use(async (err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

// Terminate server on error
const exitHandler = () => {
  if (server) {
    logger.info(`Terminate the server on port ${PORT}`);
    process.exit(1);
  } else {
    process.exit(1);
  }
};

// Handle unexpected error
const unexpectedErrorHandler = (err: unknown) => {
  logger.error(err);
  exitHandler();
};

// Listen for server error logs
process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

// Terminate server gracefully
process.on("SIGTERM", () => {
  if (server) {
    logger.info(`Terminate the server on port ${PORT}`);
    process.exit(1);
  }
});
