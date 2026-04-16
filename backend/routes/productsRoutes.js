import express from "express";
import Product from "../models/product.js";
import { validateProductId, validateProduct, validateProductUpdate, handleValidationErrors } from "../middleware/validation.js";

const router = express.Router();

function generateProductId() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

router.post("/product", validateProduct, handleValidationErrors, async (req, res) => {
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

router.get("/products", async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
    .sort({ createdAt: -1 })
    .select("-__v -_id")
    .lean();

    return res.status(200).json(products);
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({
      message: "Failed to fetch products"
    });
  }
});

router.get("/product/:id", validateProductId, handleValidationErrors, async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findOne({ productId: id })
    .select("-__v -_id")
    .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({
      message: "Failed to fetch product",
    });
  }
});

router.patch("/product/:id", validateProductId, validateProductUpdate, handleValidationErrors, async (req, res) => {
  const { id } = req.params;

  try {
    const updatedProduct = await Product.findOneAndUpdate(
        { productId: id },
        { $set: req.body },
        { new: true, runValidators: true }
    )
    .select("-__v -_id")
    .lean()

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error.message)
    return res.status(400).json({
      message: "Failed to update product"
    });
  }
});

router.delete("/product/:id", validateProductId, handleValidationErrors, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await Product.findOneAndDelete({ productId: id });

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: `${deletedProduct.name} deleted successfully` });
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({
      message: "Failed to delete product"
    });
  }
});

export default router;