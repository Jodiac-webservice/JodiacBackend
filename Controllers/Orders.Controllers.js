const db = require("../models/index.model");
const ConfirmOrder = db.orders;
const { createShiprocketOrder, getShiprocketOrderDetails } = require("../config/Shiproket.config");

exports.createOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const { orderItems, shippingAddress, paymentMethod, totalAmount } = req.body;
        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: "No order items provided" });
        }
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
        const shiprocketResponse = await createShiprocketOrder(
            createdOrder,
            shippingAddress,
            orderItems,
            paymentMethod,
            totalAmount
        );
        createdOrder.shiprocketOrderId = shiprocketResponse.order_id;
        createdOrder.shiprocketAwbCode = shiprocketResponse.awb_code;
        await createdOrder.save();
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

exports.getAllOrders = async (req, res) => {
    try {
        const userId = req.userId;
        const orders = await ConfirmOrder.find({ userId })
            .populate({
                path: 'orderItems.productId',
                model: 'Product',
                select: 'name images' 
            })
            .sort({ createdAt: -1 });
            
        if (!orders) {
            return res.status(404).json({ message: "No orders found for this user." });
        }
        const formattedOrders = orders.map(order => ({
            ...order.toObject(),
            orderItems: order.orderItems.map(item => ({
                ...item.toObject(),
                productName: item.productId?.name || null,
                productImage: item.productId?.images?.[0] || null,
            }))
        }));

        res.status(200).json({
            message: "Orders retrieved successfully",
            orders: formattedOrders
        });
    } catch (error) {
        console.error("Error fetching all orders:", error);
        res.status(500).json({
            message: "Server error while fetching orders",
            error: error.message
        });
    }
};

exports.getOrderStatus = async (req, res) => {
    try {
        const userId = req.userId;
        const { orderId } = req.params;

        const order = await ConfirmOrder.findById(orderId);
        if (!order || order.userId.toString() !== userId) {
            return res.status(404).json({ message: "Order not found or you do not have permission to view it." });
        }

        if (!order.shiprocketOrderId) {
            return res.status(400).json({ message: "Shiprocket order ID not found for this order. It may not have been created yet." });
        }
        const shiprocketResponse = await getShiprocketOrderDetails(order.shiprocketOrderId);
        const shiprocketStatusMap = {
            1: "Confirmed",
            7: "Packed",
            8: "Packed",
            10: "Shipped",
            12: "Shipped",
            14: "Out for Delivery",
            15: "Delivered",
            16: "Delivered",
            17: "Cancelled",
            18: "Cancelled"
        };
        const shiprocketStatusCode = shiprocketResponse.data?.status_code || null;
        const awbCode = shiprocketResponse.data?.shipments?.awb || "N/A";
        const currentStatus = shiprocketStatusMap[shiprocketStatusCode] || "Unknown"; 
        if (order.status !== currentStatus || order.awbCode !== awbCode) {
            order.status = currentStatus;
            order.awbCode = awbCode; 
            await order.save();
        }
        res.status(200).json({
            message: "Order status retrieved successfully",
            status: currentStatus,
            trackingDetails: {
                awb_code: awbCode,
                current_status: currentStatus
            }
        });
    } catch (error) {
        console.error("Error fetching order status:", error);
        res.status(500).json({
            message: "Server error while fetching order status",
            error: error.message
        });
    }
};