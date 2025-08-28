require("dotenv").config();
const config = require("../config/auth.config");
const db = require("../models/index.model");
const User = db.user;
const Orders = db.orders;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.adminSignup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({
      email,
      password: hashedPassword,
      name,
      role: "admin",
    });

    await newAdmin.save();
    const token = jwt.sign({ id: newAdmin._id, role: "admin" }, config.secret, {
      expiresIn: "24h",
    });

    res.status(201).json({
      accessToken: token,
      message: "Admin registered successfully!",
    });
  } catch (error) {
    console.error("Admin Signup Error:", error);
    res.status(500).json({ message: "Something went wrong during admin registration." });
  }
};

exports.getActiveOrders = async (req, res) => {
  try {
    const activeOrders = await Orders.find({
      orderStatus: { $nin: ["Delivered", "Cancelled"] },
    });

    const activeCount = activeOrders.length;

    return res.status(200).send({
      success: true,
      totalActiveOrders: activeCount,
      orders: activeOrders,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getRevenueAndCost = async (req, res) => {
  try {
    const orders = await Orders.find({ orderStatus: "Delivered", isPaid: true });

    let totalRevenue = 0;
    let totalCost = 0;

    orders.forEach(order => {
      totalRevenue += order.totalAmount;

      order.orderItems.forEach(item => {
        if (item.cost) {
          totalCost += item.cost * item.quantity;
        }
      });
    });

    const profitMargin =
      totalRevenue > 0
        ? ((totalRevenue - totalCost) / totalRevenue) * 100
        : 0;

    res.json({
      success: true,
      revenue: totalRevenue,
      cost: totalCost,
      profitMargin: profitMargin.toFixed(2),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getRevenue = async (req, res) => {
  try {
    const orders = await Orders.find({ orderStatus: "Delivered", isPaid: true });

    let totalRevenue = 0;
    orders.forEach(order => {
      totalRevenue += order.totalAmount;
    });

    res.json({
      success: true,
      totalRevenue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};