const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

// Define product schema and model within the single file
const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  discount_price: Number,
  discount_percentage: Number,
  image_url: String,
  rating: Number,
  brand_name: String,
  category: String,
});

const Product = mongoose.model("products", productSchema);

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get single product by ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Flash-sale API (products with a specific discount percentage)
app.get("/api/products/flash-sale", async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ discount_percentage: -1 })
      .limit(6);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch flash-sale products" });
  }
});

// Most popular products based on rating
app.get("/api/products/most-popular", async (req, res) => {
  try {
    const products = await Product.find().sort({ rating: -1 }).limit(5);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch popular products" });
  }
});

// Filtered products by brand or category
app.get("/api/products/filter", async (req, res) => {
  try {
    const { brand, category } = req.query;
    const filter = {};
    if (brand) filter.brand_name = brand;
    if (category) filter.category = category;

    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch filtered products" });
  }
});

app.listen(PORT, (req, res) => {
  console.log(`Server running on port ${PORT}`);
});
