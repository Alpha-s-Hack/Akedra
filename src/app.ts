import path from "path";
import cors from "cors";

// Third-party imports
import express from "express";
import mongoose from "mongoose";

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

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log("Request Headers:", req.headers);
  next();
});

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

// Start server function
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Upload path configured at: ${uploadPath}`);
    });

    server.on("error", (error: any) => {
      if (error.code === "EADDRINUSE") {
        console.log(`Port ${PORT} is busy, trying again...`);
        setTimeout(() => {
          server.close();
          server.listen(PORT);
        }, 1000);
      } else {
        console.error("Server error:", error);
      }
    });
  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
