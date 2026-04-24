import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "./models/product.js";
import ActivityLog from "./models/activityLog.js";
import Order from "./models/order.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI;

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB...");

    // 1. Create 3 Sample Products
    const products = [
      { productId: "11112222", name: "Jollof Rice", price: 2500, category: "Main", countInStock: 50, isActive: true },
      { productId: "33334444", name: "Beef Suya", price: 1500, category: "Sides", countInStock: 30, isActive: true },
      { productId: "55556666", name: "Zobo Drink", price: 500, category: "Drinks", countInStock: 100, isActive: true },
    ];
    
    // Using updateOne with upsert to avoid duplicates if run multiple times
    for (const p of products) {
      await Product.updateOne({ productId: p.productId }, { $set: p }, { upsert: true });
    }
    console.log("Products seeded/updated.");

    // 2. Create 15 Click Intent Logs (Simulating users browsing)
    const logs = [];
    for (let i = 0; i < 15; i++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      logs.push({
        action: "click_intent",
        targetType: "product",
        targetId: randomProduct.productId,
        details: "Customer clicked: Order via WhatsApp",
        ipAddress: "127.0.0.1",
        deviceInfo: "Chrome / Windows",
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)) // Random dates in the past
      });
    }
    await ActivityLog.insertMany(logs);
    console.log("Activity logs seeded.");

    // 3. Create 5 Sample Orders
    const orders = [
      {
        orderId: "ORD-9001",
        customerName: "Alice",
        customerAddress: "Lagos",
        items: [{ productId: "11112222", name: "Jollof Rice", quantity: 2, priceAtPurchase: 2500 }],
        deliveryFee: 500,
        totalAmount: 5500,
        status: "completed"
      },
      {
        orderId: "ORD-9002",
        customerName: "Bob",
        customerAddress: "Abuja",
        items: [
          { productId: "33334444", name: "Beef Suya", quantity: 5, priceAtPurchase: 1500 },
          { productId: "55556666", name: "Zobo Drink", quantity: 2, priceAtPurchase: 500 }
        ],
        deliveryFee: 500,
        totalAmount: 9000,
        status: "pending"
      }
    ];
    
    for (const o of orders) {
      await Order.updateOne({ orderId: o.orderId }, { $set: o }, { upsert: true });
    }
    console.log("Orders seeded/updated.");

    console.log("\nSuccess! You can now test your analytics routes.");
    console.log("GET /api/admin/analytics/click-insights");
    console.log("GET /api/admin/analytics/purchase-insights");
    
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
}

seed();
