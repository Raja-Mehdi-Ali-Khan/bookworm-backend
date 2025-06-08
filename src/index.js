import express from "express";
import cors from "cors";
import "dotenv/config";
import job from "./lib/cron.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database before starting server
const startServer = async () => {
  try {
    await connectDB(); // Wait for DB connection
    console.log("Database connected successfully");

    // Middleware
    app.use(express.json()); // Parse JSON bodies
    app.use(cors({ 
      origin: process.env.CLIENT_URL || "*", // Restrict to frontend origin in production
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }));

    // Ensure all responses are JSON
    app.use((req, res, next) => {
      res.setHeader("Content-Type", "application/json");
      next();
    });

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/books", bookRoutes);

    // Handle 404 - Route not found
    app.use((req, res) => {
      res.status(404).json({ message: "Route not found" });
    });

    // Global error middleware
    app.use((err, req, res, next) => {
      console.error("Server error:", err.message);
      res.status(500).json({ message: "Internal server error" });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      job.start(); // Start cron job after server is running
    });
  } catch (error) {
    console.error("Failed to connect to database:", error.message);
    process.exit(1); // Exit if DB connection fails
  }
};

// Start the server
startServer();