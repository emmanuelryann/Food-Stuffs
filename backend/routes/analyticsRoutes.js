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

// Compares WhatsApp clicks vs completed sales per product
router.get("/admin/analytics/conversion", requireAuth, async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = {};

    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.$gte = new Date(from);
      if (to) dateFilter.createdAt.$lte = new Date(to);
    }

    // 1. Get all click counts grouped by product (handling both string and array targetId)
    const clicks = await ActivityLog.aggregate([
      { $match: { action: "click_intent", ...dateFilter } },
      // Unwind targetId in case it's an array of product IDs
      { 
        $unwind: {
          path: "$targetId",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $group: {
          _id: "$targetId",
          totalClicks: { $sum: 1 },
        },
      },
    ]);

    // 2. Get all completed sales grouped by product
    const sales = await Order.aggregate([
      { $match: { status: "completed", ...dateFilter } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.name" },
          totalSales: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.priceAtPurchase"] },
          },
        },
      },
    ]);

    // 3. Get all product names from the Product collection to ensure names show up for clicks with no sales
    const Product = (await import("../models/product.js")).default;
    const allProducts = await Product.find({}).select("productId name").lean();
    const nameMap = new Map(allProducts.map(p => [p.productId, p.name]));

    // 4. Merge datasets
    const productMap = new Map();

    for (const click of clicks) {
      const productId = String(click._id);
      const productName = nameMap.get(productId);
      if (!productName) continue; // Skip deleted products

      productMap.set(productId, {
        productId,
        productName,
        totalClicks: click.totalClicks,
        totalSales: 0,
        totalRevenue: 0,
        conversionRate: "0.00%",
      });
    }

    for (const sale of sales) {
      const productId = String(sale._id);
      const productName = nameMap.get(productId);
      if (!productName) continue; // Skip deleted products

      if (productMap.has(productId)) {
        const entry = productMap.get(productId);
        entry.totalSales = sale.totalSales;
        entry.totalRevenue = sale.totalRevenue;
        entry.conversionRate =
          ((sale.totalSales / entry.totalClicks) * 100).toFixed(2) + "%";
      } else {
        productMap.set(productId, {
          productId,
          productName,
          totalClicks: 0,
          totalSales: sale.totalSales,
          totalRevenue: sale.totalRevenue,
          conversionRate: "N/A",
        });
      }
    }

    const insights = Array.from(productMap.values()).sort(
      (a, b) => (b.totalSales || 0) - (a.totalSales || 0) || b.totalClicks - a.totalClicks
    );

    return res.status(200).json({
      total: insights.length,
      insights,
    });
  } catch (error) {
    console.error("Conversion Analytics Error:", error.message);
    return res.status(500).json({ message: "Failed to fetch conversion data" });
  }
});

export default router;