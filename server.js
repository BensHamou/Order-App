const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

const data = require("./data");
const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {});

const Product = mongoose.model(
  "products",
  new mongoose.Schema({
    name: String,
    description: String,
    image: String,
    price: Number,
    calorie: Number,
    category: String,
    isAvalaible: { type: Boolean, default: true },
  })
);

const Category = mongoose.model(
  "categories",
  new mongoose.Schema({
    name: String,
    image: String,
  })
);

// app.get("/api/products/seed", async (req, res) => {
//   const products = await Product.insertMany(data.products);
//   res.send({ products });
// });

// app.get("/api/categories/seed", async (req, res) => {
//   const categories = await Category.insertMany(data.categories);
//   res.send({ categories });
// });

app.get("/api/products", async (req, res) => {
  const { category } = req.query;
  const products = await Product.find(category ? { category } : {});
  res.send(products);
});

app.post("/api/products", async (req, res) => {
  const newProduct = new Product(req.body);
  const savedProduct = await newProduct.save();
  res.send(savedProduct);
});

app.post("/api/categories", async (req, res) => {
  const newCategory = new Category(req.body);
  const savedCategory = await newCategory.save();
  res.send(savedCategory);
});

app.get("/api/categories", async (req, res) => {
  const categories = await Category.find({});
  res.send(categories);
});

const Order = mongoose.model(
  "orders",
  new mongoose.Schema(
    {
      number: { type: Number, default: 0 },
      orderType: String,
      paymentType: String,
      isPaid: { type: Boolean, default: false },
      isReady: { type: Boolean, default: false },
      inProgress: { type: Boolean, default: true },
      isCanceled: { type: Boolean, default: false },
      isDelivered: { type: Boolean, default: false },
      totalPrice: Number,
      taxPrice: Number,
      orderItems: [
        {
          name: String,
          price: Number,
          quantity: Number,
        },
      ],
    },
    {
      timestamps: true,
    }
  )
);

app.get("/api/orders", async (req, res) => {
  const orders = await Order.find({ isDelivered: false, isCanceled: false });
  res.send(orders);
});

app.put("/api/orders/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    if (req.body.action === "ready") {
      order.isReady = true;
      order.inProgress = false;
    } else if (req.body.action === "deliver") {
      order.isDelivered = true;
    } else if (req.body.action === "cancel") {
      order.isCanceled = true;
    }
    await order.save();
    res.send({ message: "Done." });
  } else {
    res.status(404).send({ message: "Order not found" });
  }
});

app.put("/api/products/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  const { name, image, category, calorie, price } = req.body;
  if (product) {
    if (product.image !== image) product.image = image;
    if (product.price !== price) product.price = price;
    if (product.calorie !== calorie) product.calorie = calorie;
    if (product.category !== category) product.category = category;
    if (product.name !== name) product.name = name;
    await product.save();
    res.send({ message: "Done." });
  } else {
    res.status(404).send({ message: "Product not found" });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  const category = await Category.findById(req.params.id);
  const { name, image } = req.body;
  if (category) {
    if (category.image !== image) category.image = image;
    if (category.name !== name) category.name = name;
    await category.save();
    res.send({ message: "Done." });
  } else {
    res.status(404).send({ message: "Category not found" });
  }
});

app.put("/api/products/available/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    product.isAvalaible = !product.isAvalaible;
    await product.save();
    res.send({ message: "Done." });
  } else {
    res.status(404).send({ message: "Product not found" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  res.send(product);
});

app.delete("/api/categories/:id", async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  res.send(category);
});

app.post("/api/orders", async (req, res) => {
  const lastOrder = await Order.find().sort({ number: -1 }).limit(1);
  const lastNumber = lastOrder.length === 0 ? 0 : lastOrder[0].number;
  if (
    !req.body.orderType ||
    !req.body.paymentType ||
    !req.body.orderItems ||
    req.body.orderItems.length === 0
  ) {
    return res.send({ message: "Data is required." });
  }
  const order = await Order({ ...req.body, number: lastNumber + 1 }).save();
  res.send(order);
});

app.get("/api/orders/queue", async (req, res) => {
  const inProgressOrders = await Order.find(
    { inProgress: true, isCanceled: false },
    "number"
  );
  const servingOrders = await Order.find(
    { isReady: true, isDelivered: false },
    "number"
  );
  res.send({ inProgressOrders, servingOrders });
});

app.use(express.static(path.join(__dirname, "/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/build/index.html"));
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
