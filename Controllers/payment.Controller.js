const razorpay = require("../config/RozorPay.config");
const ConfirmOrder = require("../models/orders.models");
const crypto = require("crypto");

// Step 1: Create Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees

    if (!amount) return res.status(400).json({ message: "Amount is required" });

    const options = {
      amount: amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderData, shippingAddress, userId, paymentMethod } = req.body;

    if (!userId || !shippingAddress) {
      return res.status(400).json({ success: false, message: "User ID and shipping address are required" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const order = new ConfirmOrder({
        userId,
        shippingAddress,
        paymentMethod,
        orderData,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        status: "paid",
      });

      await order.save();

      return res.status(200).json({ success: true, message: "Payment verified & order created" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    console.error("Error in verifyPayment:", err);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


