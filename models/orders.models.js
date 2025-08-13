const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required: true 
    },
    productName: { 
        type: String, 
        required: true 
    },
    quantity: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    price: { 
        type: Number, 
        required: true 
    }
});

const confirmOrderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    orderItems: [orderItemSchema],

    shippingAddress: {
        name: { type: String, required: true },
        phone: { type: Number, required: true },
        streetAddress: { type: String, required: true },
        Landmark: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: Number, required: true },
        state: { type: String, required: true }
    },

    paymentMethod: {
        type: String,
        required: true,
        enum: ['Cash on Delivery', 'UPI', 'Card', 'Net Banking', 'Wallet']
    },

    paymentStatus: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Paid', 'Failed']
    },

    totalAmount: { 
        type: Number, 
        required: true 
    },

    orderStatus: {
        type: String,
        default: 'Confirmed',
        enum: ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled']
    },

    isDelivered: {
        type: Boolean,
        default: false
    },

    deliveredAt: {
        type: Date
    },

    isPaid: {
        type: Boolean,
        default: false
    },

    paidAt: {
        type: Date
    }

}, { timestamps: true });

const ConfirmOrder = mongoose.model('ConfirmOrder', confirmOrderSchema);

module.exports = ConfirmOrder;
