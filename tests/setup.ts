import dotenv from "dotenv";
import path from "path";

// Load .env.test before tests run
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

// Set test environment
process.env.NODE_ENV = "test";
