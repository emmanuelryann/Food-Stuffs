import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";
import AdminSession from "../models/adminSession.js";
import { validateSignup, validateLogin, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Helper function to parse device info from user agent
const getDeviceInfo = (userAgent) => {
	if (!userAgent) return "Unknown Device";

	const browsers = {
		Chrome: "Chrome",
		Firefox: "Firefox",
		Safari: "Safari",
		Edge: "Edge",
		Opera: "Opera",
		Postman: "Postman"
	};

	let browser = "Unknown Browser";

	for (const [key, value] of Object.entries(browsers)) {
		if (userAgent.includes(key)) {
			browser = value;
			break;
		}
	}

	const operatingSystems = {
		iPhone: "iPhone",
		iPad: "iPad",
		Android: "Android",
		Windows: "Windows",
		Macintosh: "macOS",
		Linux: "Linux",
		X11: "Linux"
	}

	let os = "Unknown OS";

	for (const [key, value] of Object.entries(operatingSystems)) {
		if (userAgent.includes(key)) {
			os = value;
			break;
		}
	}

	return `${browser} on ${os}`;
};

router.post("/signup", validateSignup, handleValidationErrors, async (req, res) => {
	try {
		const { name, email, password, role } = req.body;

		// Check if admin already exists
		const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
		if (existingAdmin) {
			return res.status(409).json({
				success: false,
				message: "Admin with this email already exists",
			});
		}

		// Hash password
		const saltRounds = 12;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Create new admin
		const newAdmin = new Admin({
			name: name.trim(),
			email: email.toLowerCase().trim(),
			password: hashedPassword,
			role: role,
		});

		// Save admin
		await newAdmin.save();

		res.status(201).json({
			success: true,
			message: "Admin account created successfully",
			admin: {
				id: newAdmin._id,
				name: newAdmin.name,
				email: newAdmin.email,
				role: newAdmin.role,
				status: newAdmin.status,
				createdAt: newAdmin.createdAt,
			},
		});

	} catch (error) {
		console.error("Signup error:", error);

		// Handle duplicate key error
		if (error.code === 11000) {
			return res.status(400).json({
				success: false,
				message: "Admin with this email already exists",
			});
		}

		res.status(500).json({
			success: false,
			message: "Server error during signup",
		});
	}
});

router.post("/login", validateLogin, handleValidationErrors, async (req, res) => {
	try {
		const { email, password } = req.body;

		// Find admin by email
		const admin = await Admin.findOne({ email: email.toLowerCase() });
		if (!admin) {
			return res.status(401).json({
				success: false,
				message: "Invalid email or password",
			});
		}

		// Check admin status
		if (admin.status !== 'active') {
			const statusMessages = {
				deactivated: "Your account has been deactivated. Please contact support.",
				suspended: "Your account has been suspended. Please contact support.",
				deleted: "Your account has been deleted.",
			};
			return res.status(403).json({
				success: false,
				message: statusMessages[admin.status] || "You are not permitted to login.",
			});
		}

		// Check if account is locked
		if (admin.lockUntil && admin.lockUntil > Date.now()) {
			const minutesLeft = Math.ceil((admin.lockUntil - Date.now()) / 60000);
			return res.status(423).json({
				success: false,
				message: `Account is locked. Try again in ${minutesLeft} minute(s).`,
			});
		}

		// Compare password
		const isPasswordValid = await bcrypt.compare(password, admin.password);
		if (!isPasswordValid) {
			const maxAttempts = 5;
			const newAttempts = admin.loginAttempts + 1;
			const update = { loginAttempts: newAttempts };

			// Lock account for 15 minutes after 5 failed attempts
			if (newAttempts >= maxAttempts) {
				update.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
			}

			await Admin.updateOne({ _id: admin._id }, { $set: update });

			return res.status(401).json({
				success: false,
				message: newAttempts >= maxAttempts
					? "Too many failed attempts. Account locked for 15 minutes."
					: `Invalid email or password. ${maxAttempts - newAttempts} attempt(s) remaining.`,
			});
		}

		// Successful login — reset attempts and update lastLogin
		await Admin.updateOne(
			{ _id: admin._id },
			{ $set: { loginAttempts: 0, lastLogin: new Date() }, $unset: { lockUntil: 1 } }
		);

		// Create JWT token
		const token = jwt.sign(
			{ adminId: admin._id, email: admin.email, role: admin.role },
			process.env.JWT_SECRET,
			{ expiresIn: "7d" }
		);

		// Get device info from user agent
		const userAgent = req.headers['user-agent'] || 'Unknown Device';
		const deviceInfo = getDeviceInfo(userAgent);

		// Get IP address
		const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || "Unknown IP";

		// Set expiry date to 7 days from now
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7);

		// Delete session with same adminId and ipAddress
		await AdminSession.deleteMany({ adminId: admin._id, ipAddress: ipAddress });

		// Create new session document
		const newSession = new AdminSession({
			adminId: admin._id,
			token: token.substring(0, 50),
			deviceInfo: deviceInfo,
			ipAddress: ipAddress,
			isActive: true,
			expiresAt: expiresAt,
		});

		await newSession.save();

		// Send JWT token as cookie
		res.cookie('authToken', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		res.status(200).json({
			success: true,
			message: "Login successful",
			admin: {
				id: admin._id,
				name: admin.name,
				email: admin.email,
				role: admin.role,
				status: admin.status,
			},
		});

	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({
			success: false,
			message: "Server error during login",
		});
	}
});

router.post("/logout", async (req, res) => {
	try {
		const token = req.cookies.authToken || req.headers.authorization?.split(' ')[1];

		if (!token) {
			return res.status(400).json({
				success: false,
				message: "No session token found",
			});
		}

		// Delete only the active session with matching token
		await AdminSession.deleteOne({
			token: token.substring(0, 50),
			isActive: true
		});

		// Clear the cookie
		res.clearCookie('authToken', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
		});

		res.status(200).json({
			success: true,
			message: "Logout successful",
		});

	} catch (error) {
		console.error("Logout error:", error);
		res.status(500).json({
			success: false,
			message: "Server error during logout",
		});
	}
});

export default router;