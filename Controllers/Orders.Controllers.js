const db = require("../models/index.model");
const ConfirmOrder = db.orders;
const { createShiprocketOrder } = require("../config/Shiproket.config");

const createOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const { orderItems, shippingAddress, paymentMethod, totalAmount } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: "No order items provided" });
        }

        // 1️⃣ Save order in MongoDB
        const order = new ConfirmOrder({
            userId,
            orderItems,
            shippingAddress,
            paymentMethod,
            totalAmount,
            paymentStatus: paymentMethod === "Cash on Delivery" ? "Pending" : "Paid",
            isPaid: paymentMethod !== "Cash on Delivery",
            paidAt: paymentMethod !== "Cash on Delivery" ? Date.now() : null,
        });

        const createdOrder = await order.save();

        // 2️⃣ Send order to Shiprocket
        const shiprocketResponse = await createShiprocketOrder(
            createdOrder,
            shippingAddress,
            orderItems,
            paymentMethod,
            totalAmount
        );

        // 3️⃣ Respond back
        res.status(201).json({
            message: "Order created successfully",
            order: createdOrder,
            shiprocket: shiprocketResponse,
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({
            message: "Server error while creating order",
            error: error.message
        });
    }
};

module.exports = { createOrder };
