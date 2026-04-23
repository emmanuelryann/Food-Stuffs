import express from "express";
import StoreSettings from "../models/storeSettings.js";
import { requireSuperAdmin } from "../middleware/authentication.js";
import { validateSettings, handleValidationErrors } from "../middleware/validation.js";
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

// Public — Frontend fetches this on app load
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

export default router;
