import express from "express";
import StoreSettings from "../models/storeSettings.js";
import Admin from "../models/admin.js";
import AdminSession from "../models/adminSession.js";
import { requireSuperAdmin } from "../middleware/authentication.js";
import { validateSettings, validateAdminStatus, handleValidationErrors } from "../middleware/validation.js";
import { logActivity } from "../utils/logActivity.js";

const router = express.Router();
const SETTINGS_ID = "global_settings";

// Seed default settings on first server start
async function seedSettings() {
  const existing = await StoreSettings.findById(SETTINGS_ID);
  if (!existing) {
    await StoreSettings.create({ _id: SETTINGS_ID });
    console.log("Default store settings created.");
  }
}
seedSettings().catch(err => console.error("Settings seed failed:", err.message));

router.get("/settings", async (req, res) => {
  try {
    const settings = await StoreSettings.findById(SETTINGS_ID)
      .select("-__v -updatedBy")
      .lean();

    if (!settings) {
      return res.status(404).json({ message: "Store settings not found" });
    }

    return res.status(200).json(settings);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Failed to fetch store settings" });
  }
});

// Super Admin only — Update global settings
router.patch("/settings", requireSuperAdmin, validateSettings, handleValidationErrors, async (req, res) => {
  try {
    // Get previous values for the activity log
    const previousSettings = await StoreSettings.findById(SETTINGS_ID).lean();

    const updateData = { ...req.body };
    updateData.updatedBy = {
      adminId: req.user.adminId,
      email: req.user.email,
    };

    const updatedSettings = await StoreSettings.findByIdAndUpdate(
      SETTINGS_ID,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .select("-__v")
      .lean();

    if (!updatedSettings) {
      return res.status(404).json({ message: "Store settings not found" });
    }

    // Log which fields changed and their previous values
    const changedFields = {};
    for (const key of Object.keys(req.body)) {
      if (previousSettings[key] !== undefined && previousSettings[key] !== req.body[key]) {
        changedFields[key] = { from: previousSettings[key], to: req.body[key] };
      }
    }

    logActivity({
      action: 'settings_updated',
      performedBy: { adminId: req.user.adminId, email: req.user.email, role: req.user.role },
      targetType: 'settings',
      targetId: SETTINGS_ID,
      details: `Store settings updated`,
      metadata: { changedFields },
      req,
    });

    return res.status(200).json(updatedSettings);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Failed to update store settings" });
  }
});

// Update admin status (super admin only)
router.patch("/admin/:id/status", requireSuperAdmin, validateAdminStatus, handleValidationErrors, async (req, res) => {
	try {
		const { id } = req.params;
		const { status } = req.body;

		// Prevent super admin from changing their own status
		if (id === req.user.adminId) {
			return res.status(403).json({ success: false, message: "You cannot change your own account status" });
		}

		const admin = await Admin.findById(id);
		if (!admin) {
			return res.status(404).json({ success: false, message: "Admin not found" });
		}

		const previousStatus = admin.status;

		// Update the status
		await Admin.updateOne({ _id: id }, { $set: { status } });

		// If the admin is being deactivated/suspended/deleted, kill all their active sessions
		if (status !== 'active') {
			await AdminSession.deleteMany({ adminId: id });
		}

		logActivity({
			action: 'admin_status_updated',
			performedBy: { adminId: req.user.adminId, email: req.user.email, role: req.user.role },
			targetType: 'admin',
			targetId: id,
			details: `Admin status changed from ${previousStatus} to ${status}: ${admin.email}`,
			metadata: { previousStatus, newStatus: status },
			req,
		});

		return res.status(200).json({
			success: true,
			message: `Admin status updated to ${status}`,
			admin: { id: admin._id, name: admin.name, email: admin.email, status },
		});
	} catch (error) {
		console.error("Update admin status error:", error);
		return res.status(500).json({ success: false, message: "Server error during status update" });
	}
});

export default router;