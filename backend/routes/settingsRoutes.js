import express from "express";
import StoreSettings from "../models/storeSettings.js";
import Admin from "../models/admin.js";
import AdminSession from "../models/adminSession.js";
import { requireSuperAdmin } from "../middleware/authentication.js";
import { validateSettings, validateAdminUpdate, handleValidationErrors } from "../middleware/validation.js";
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

// Fetch all admins (super admin only)
router.get("/admins", requireSuperAdmin, async (req, res) => {
  try {
    const admins = await Admin.find({})
      .select("-password -__v -passwordResetToken -passwordResetExpires")
      .sort({ createdAt: -1 })
      .lean();
    
    return res.status(200).json(admins);
  } catch (error) {
    console.error("Fetch admins error:", error);
    return res.status(500).json({ message: "Failed to fetch admins" });
  }
});

// Update admin details (super admin only)
router.patch("/admin/:id", requireSuperAdmin, validateAdminUpdate, handleValidationErrors, async (req, res) => {
	try {
		const { id } = req.params;
		const { name, role, status } = req.body;

		// Prevent super admin from changing their own status or role (they can change their name)
		if (id === req.user.adminId && (status !== undefined || role !== undefined)) {
			return res.status(403).json({ success: false, message: "You cannot change your own account status or role from this panel" });
		}

		const admin = await Admin.findById(id);
		if (!admin) {
			return res.status(404).json({ success: false, message: "Admin not found" });
		}

		const updateData = {};
		if (name !== undefined) updateData.name = name;
		if (role !== undefined) updateData.role = role;
		if (status !== undefined) updateData.status = status;

		const changedFields = {};
		for (const key of Object.keys(updateData)) {
			if (admin[key] !== updateData[key]) {
				changedFields[key] = { from: admin[key], to: updateData[key] };
			}
		}

		if (Object.keys(changedFields).length === 0) {
			return res.status(200).json({ success: true, message: "No changes made", admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role, status: admin.status } });
		}

		await Admin.updateOne({ _id: id }, { $set: updateData });

		// If the admin is being deactivated/suspended/deleted, kill all their active sessions
		if (updateData.status && updateData.status !== 'active') {
			await AdminSession.deleteMany({ adminId: id });
		}

		logActivity({
			action: 'admin_updated',
			performedBy: { adminId: req.user.adminId, email: req.user.email, role: req.user.role },
			targetType: 'admin',
			targetId: admin.email,
			details: `Admin details updated: ${admin.email}`,
			metadata: { changedFields },
			req,
		});

		// Fetch updated admin to return
		const updatedAdmin = await Admin.findById(id).select("-password -__v");

		return res.status(200).json({
			success: true,
			message: `Admin details updated successfully`,
			admin: updatedAdmin,
		});
	} catch (error) {
		console.error("Update admin error:", error);
		return res.status(500).json({ success: false, message: "Server error during admin update" });
	}
});

export default router;