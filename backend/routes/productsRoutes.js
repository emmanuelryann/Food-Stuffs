import express from "express";
import mongoose from "mongoose";
import Product from "../models/product.js";

const router = express.Router();

function generateProductId() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// CREATE a new product
router.post("/product", async (req, res) => {
  try {
    const { name, description, price, category, countInStock, image, isActive } = req.body;
    let inserted = false;
    let product;

    while (!inserted) {
      try {
        const productId = generateProductId();
        product = await Product.create({
          productId,
          name,
          description,
          price,
          category,
          countInStock,
          image,
          isActive: isActive ?? true
        });
        inserted = true;
      } catch (error) {
        if (error.code === 11000) continue;
        throw error;
      }
    }

    return res.status(201).json(product);
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({
      message: "Failed to create product",
    });
  }
});

// READ all products
router.get("/products", async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
});

// READ one product by ID
router.get("/product/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
});

// UPDATE a product by ID
router.put("/product/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(updatedProduct);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
});

// DELETE a product by ID
router.delete("/product/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
});

export default router;