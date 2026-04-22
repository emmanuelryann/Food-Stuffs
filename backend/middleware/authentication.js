import jwt from "jsonwebtoken";
import AdminSession from "../models/adminSession.js";

export async function requireAuth(req, res, next) {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if session still exists in database
    const session = await AdminSession.findOne({
      adminId: decoded.adminId,
      token: token,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      res.clearCookie("authToken");
      return res.status(401).json({ message: "Session invalid or expired" });
    }

    req.user = decoded;

    next();
  } catch (err) {
    console.error("requireAuth error:", err.message);
    return res.status(401).json({ message: "Invalid authentication token" });
  }
}

export async function requireSuperAdmin(req, res, next) {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if session still exists in database
    const session = await AdminSession.findOne({
      adminId: decoded.adminId,
      token: token,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      res.clearCookie("authToken");
      return res.status(401).json({ message: "Session invalid or expired" });
    }

    req.user = decoded;

    // Check if user is a super admin
    if (decoded.role !== "super_admin") {
      return res.status(403).json({ message: "Forbidden: Super Admin access required" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired authentication token" });
  }
}