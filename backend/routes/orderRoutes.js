import express from "express";
import Order from "../models/order.js";
import Product from "../models/product.js";
import { validateCheckout, handleValidationErrors } from "../middleware/validation.js";

const router = express.Router();

function generateOrderId() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${num}`;
}

function formatOrderMessage(order) {
  let message = `🧾 *Order #${order.orderId}*\n\n`;

  order.items.forEach((item) => {
    const lineTotal = item.quantity * item.priceAtPurchase;
    message += `• ${item.name} x${item.quantity} — $${lineTotal.toFixed(2)}\n`;
  });

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.quantity * item.priceAtPurchase,
    0
  );

  message += `\n-------------------\n`;
  message += `Subtotal: $${subtotal.toFixed(2)}\n`;

  if (order.deliveryFee > 0) {
    message += `Delivery: $${order.deliveryFee.toFixed(2)}\n`;
  }

  message += `*Total: $${order.totalAmount.toFixed(2)}*\n`;

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

router.post("/orders/checkout", validateCheckout, handleValidationErrors, async (req, res) => {
  try {
    const {
      items,
      customerName,
      customerPhone,
      customerAddress,
      deliveryFee = 0,
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

    const orderObj = order.toObject();
    delete orderObj._id;
    delete orderObj.__v;
    if (orderObj.items) {
      orderObj.items.forEach(item => delete item._id);
    }

    const formattedMessage = formatOrderMessage(order);
    const whatsappNumber = process.env.WHATSAPP_NUMBER || "";
    const whatsappUrl = buildWhatsAppUrl(whatsappNumber, formattedMessage);

    return res.status(201).json({
      order: orderObj,
      formattedMessage,
      whatsappUrl,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Failed to process checkout" });
  }
});

export default router;