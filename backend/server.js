import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
// import mongoSanitize from 'express-mongo-sanitize';
import connectDB from "./config/db.js";
import productsRoutes from "./routes/productsRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

// Middleware
app.use(
	cors({
		origin: ["http://localhost:3000", "http://localhost:5173"],
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(mongoSanitize());
// app.use(express.static('frontend'));

// Connect to database
connectDB();

// Routes
app.use("/auth", adminRoutes);
app.use("/api", productsRoutes);
app.use("/api", orderRoutes);
app.use("/api", settingsRoutes);
app.use("/api", analyticsRoutes);

app.get('/', (req, res) => {
	res.send('API is running and DB is connected!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});