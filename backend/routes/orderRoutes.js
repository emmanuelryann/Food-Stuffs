import express from "express";
import Order from "../models/order.js";
import Product from "../models/product.js";
import StoreSettings from "../models/storeSettings.js";
import { requireAuth, requireSuperAdmin } from "../middleware/authentication.js";
import { validateCheckout, validateOrderId, validateOrderStatus, validateBulkDelete, handleValidationErrors } from "../middleware/validation.js";
import { logActivity } from "../utils/logActivity.js";

const router = express.Router();

function generateOrderId() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${num}`;
}

function formatOrderMessage(order, settings) {
  const currency = settings.currencySymbol || "$";
  let message = `🧾 *Order #${order.orderId}*\n\n`;

  order.items.forEach((item) => {
    const lineTotal = item.quantity * item.priceAtPurchase;
    message += `• ${item.name} x${item.quantity} — ${currency}${lineTotal.toFixed(2)}\n`;
  });

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.quantity * item.priceAtPurchase,
    0
  );

  message += `\n-------------------\n`;
  message += `Subtotal: ${currency}${subtotal.toFixed(2)}\n`;

  if (order.deliveryFee > 0) {
    message += `Delivery: ${currency}${order.deliveryFee.toFixed(2)}\n`;
  }

  message += `*Total: ${currency}${order.totalAmount.toFixed(2)}*\n`;

  if (order.customerName) {
    message += `\nCustomer: ${order.customerName}`;
  }
  if (order.customerAddress) {
    message += `\nAddress: ${order.customerAddress}`;
  }

  return message;
}

function buildWhatsAppUrl(phoneNumber, message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encoded}`;
}

function cleanOrder(order) {
  const obj = order.toObject();
  delete obj._id;
  delete obj.__v;
  if (obj.items) {
    obj.items.forEach(item => delete item._id);
  }
  return obj;
}

router.post("/orders/checkout", validateCheckout, handleValidationErrors, async (req, res) => {
  try {
    // Fetch global store settings
    const settings = await StoreSettings.findById("global_settings").lean();
    if (!settings) {
      return res.status(500).json({ message: "Store settings not configured" });
    }

    if (!settings.isStoreOpen) {
      return res.status(503).json({ message: "Sorry, the store is currently closed" });
    }

    const {
      items,
      customerName,
      customerPhone,
      customerAddress,
    } = req.body;

    const productIds = items.map((item) => item.productId);

    const products = await Product.find({
      productId: { $in: productIds },
      isActive: true,
    });

    const productMap = new Map();
    products.forEach((p) => productMap.set(p.productId, p));

    const orderItems = [];
    const missingProducts = [];

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        missingProducts.push(item.productId);
        continue;
      }

      orderItems.push({
        productId: product.productId,
        name: product.name,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });
    }

    if (missingProducts.length > 0) {
      return res.status(404).json({
        message: "Some products were not found or are not in stock",
        missingProducts,
      });
    }

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.quantity * item.priceAtPurchase,
      0
    );

    // Enforce minimum order amount
    if (settings.minOrderAmount > 0 && subtotal < settings.minOrderAmount) {
      const currency = settings.currencySymbol || "$";
      return res.status(400).json({
        message: `Minimum order amount is ${currency}${settings.minOrderAmount.toFixed(2)}`,
      });
    }

    // Calculate delivery fee from store settings
    const percentageDelivery = subtotal * (settings.deliveryFeePercentage / 100);
    const deliveryFee = percentageDelivery + settings.fixedDeliveryFee;
    const totalAmount = subtotal + deliveryFee;

    let orderId;
    let isUnique = false;
    while (!isUnique) {
      orderId = generateOrderId();
      const existing = await Order.findOne({ orderId });
      if (!existing) isUnique = true;
    }

    const order = await Order.create({
      orderId,
      customerName,
      customerPhone,
      customerAddress,
      items: orderItems,
      deliveryFee,
      totalAmount,
      status: "pending",
    });

    const formattedMessage = formatOrderMessage(order, settings);
    const whatsappNumber = settings.whatsappNumber || "";
    const whatsappUrl = buildWhatsAppUrl(whatsappNumber, formattedMessage);

    logActivity({
      action: 'order_created',
      targetType: 'order',
      targetId: orderId,
      details: `New checkout order placed: ${orderId}`,
      metadata: { customerName, totalAmount },
      req,
    });

    return res.status(201).json({
      order: cleanOrder(order),
      formattedMessage,
      whatsappUrl,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Failed to process checkout" });
  }
});

router.get("/orders", requireAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .select("-__v -_id -items._id")
      .lean();

    return res.status(200).json(orders);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
});

router.delete("/orders/bulk-delete", requireSuperAdmin, validateBulkDelete, handleValidationErrors, async (req, res) => {
  try {
    const { orderIds } = req.body;

    const result = await Order.deleteMany({ orderId: { $in: orderIds } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No matching orders found" });
    }

    logActivity({
      action: 'orders_bulk_deleted',
      performedBy: { adminId: req.user.adminId, email: req.user.email, role: req.user.role },
      targetType: 'order',
      details: `Bulk deleted ${result.deletedCount} orders`,
      metadata: { deletedOrderIds: orderIds },
      req,
    });

    return res.status(200).json({
      message: `${result.deletedCount} order(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Failed to delete orders" });
  }
});

router.get("/orders/:id", requireAuth, validateOrderId, handleValidationErrors, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id })
      .select("-__v -_id -items._id")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Failed to fetch order" });
  }
});

router.patch("/orders/:id/status", requireAuth, validateOrderId, validateOrderStatus, handleValidationErrors, async (req, res) => {
  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: req.params.id },
      { $set: { status: req.body.status } },
      { new: true, runValidators: true }
    )
      .select("-__v -_id -items._id")
      .lean();

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    logActivity({
      action: 'order_status_updated',
      performedBy: { adminId: req.user.adminId, email: req.user.email, role: req.user.role },
      targetType: 'order',
      targetId: req.params.id,
      details: `Order status updated to ${req.body.status}`,
      req,
    });

    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Failed to update order status" });
  }
});

router.delete("/orders/:id", requireSuperAdmin, validateOrderId, handleValidationErrors, async (req, res) => {
  try {
    const deletedOrder = await Order.findOneAndDelete({ orderId: req.params.id });

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    logActivity({
      action: 'order_deleted',
      performedBy: { adminId: req.user.adminId, email: req.user.email, role: req.user.role },
      targetType: 'order',
      targetId: req.params.id,
      details: `Order deleted`,
      req,
    });

    return res.status(200).json({
      message: `Order #${deletedOrder.orderId} deleted successfully`,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Failed to delete order" });
  }
});

export default router;