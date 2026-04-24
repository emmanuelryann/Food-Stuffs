import express from "express";
import ActivityLog from "../models/activityLog.js";
import Order from "../models/order.js";
import { requireAuth } from "../middleware/authentication.js";

const router = express.Router();

// Returns all activity logs with optional query filters
router.get("/admin/analytics/activity-logs", requireAuth, async (req, res) => {
  try {
    const { action, targetType, from, to } = req.query;
    const filter = {};

    if (action) filter.action = action;
    if (targetType) filter.targetType = targetType;

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean();

    return res.status(200).json({
      total: logs.length,
      logs,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Failed to fetch activity logs" });
  }
});

// Aggregates click_intent logs grouped by targetId (productId)
router.get("/admin/analytics/click-insights", requireAuth, async (req, res) => {
  try {
    const { from, to } = req.query;
    const match = { action: "click_intent" };

    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    const insights = await ActivityLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$targetId",
          clickCount: { $sum: 1 },
          lastClicked: { $max: "$createdAt" },
          actionTypes: { $addToSet: "$details" },
        },
      },
      { $sort: { clickCount: -1 } },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          clickCount: 1,
          lastClicked: 1,
          actionTypes: 1,
        },
      },
    ]);

    return res.status(200).json({
      total: insights.length,
      insights,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Failed to fetch click insights" });
  }
});

// Aggregates order items to show most purchased products
router.get("/admin/analytics/purchase-insights", requireAuth, async (req, res) => {
  try {
    const { from, to, status } = req.query;
    const match = {};

    if (status) match.status = status;

    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    const insights = await Order.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.name" },
          totalQuantitySold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.priceAtPurchase"] },
          },
          orderCount: { $sum: 1 },
          lastOrdered: { $max: "$createdAt" },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: 1,
          totalQuantitySold: 1,
          totalRevenue: 1,
          orderCount: 1,
          lastOrdered: 1,
        },
      },
    ]);

    return res.status(200).json({
      total: insights.length,
      insights,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Failed to fetch purchase insights" });
  }
});

export default router;