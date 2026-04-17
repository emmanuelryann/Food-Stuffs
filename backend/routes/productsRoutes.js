import express from "express";
import Product from "../models/product.js";
import ImageKit from "imagekit";
import { validateProductId, validateProduct, validateProductUpdate, handleValidationErrors } from "../middleware/validation.js";

const router = express.Router();

let imagekit;
function getImageKit() {
  if (!imagekit) {
    imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC,
      privateKey: process.env.IMAGEKIT_PRIVATE,
      urlEndpoint: process.env.IMAGEKIT_URL,
    });
  }
  return imagekit;
}

function generateProductId() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

router.get("/product/upload-signature", (req, res) => {
  try{
    console.log("Query Received:", req.query);
    const { fileSize, fileType } = req.query;
  
    if (fileSize > 10 * 1024 * 1024) {
      return res.status(400).json({ message: "File too large" });
    }
  
    if (!["image/jpg", "image/jpeg", "image/png", "image/webp", "image/avif", "video/mp4", "video/mov"].includes(fileType)) {
      return res.status(400).json({ message: "Invalid file type" });
    }
  
    const authParams = getImageKit().getAuthenticationParameters();

    res.json(authParams);

  }catch (error) {
    console.error("ImageKit signature error:", error);
    res.status(500).json({ message: "Failed to generate upload signature" });
  }
});

// ─── Helper: delete a file from ImageKit by fileId ─────────────────────────────
async function deleteImageKitFile(fileId) {
  if (!fileId) return;
  try {
    await getImageKit().deleteFile(fileId);
  } catch (error) {
    // Log but don't throw — the DB operation should still succeed
    console.error(`ImageKit delete failed for fileId ${fileId}:`, error.message);
  }
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
          image: image ? { url: image.url, fileId: image.fileId } : undefined,
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
    // If a new image is being sent, delete the old one from ImageKit first
    if (req.body.image?.fileId) {
      const existing = await Product.findOne({ productId: id }).select("image").lean();

      if (!existing) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Delete old image from ImageKit (if one existed)
      if (existing.image?.fileId) {
        await deleteImageKitFile(existing.image.fileId);
      }
    }

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

    // Clean up image from ImageKit after successful DB deletion
    if (deletedProduct.image?.fileId) {
      await deleteImageKitFile(deletedProduct.image.fileId);
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