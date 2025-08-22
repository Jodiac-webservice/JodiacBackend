const config = require("../config/auth.config");
const db = require("../models/index.model");
const ConfirmOrder = db.orders

exports.createOrder = async (req , res)=>{
    try {
        const userId = req.userId;
        const { orderItems, shippingAddress, paymentMethod, totalAmount } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({message:'No order items provided' })
        }
        const order = new ConfirmOrder({
          userId,
          orderItems,
          shippingAddress,
          paymentMethod,
          totalAmount,
          paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
          isPaid: paymentMethod !== 'Cash on Delivery',
          paidAt: paymentMethod !== 'Cash on Delivery' ? Date.now() : null
      });
      
          const createdOrder = await order.save();
          res.status(201).json({
            message: 'Order created successfully',
            order: createdOrder
          });
      
        } catch (error) {
          console.error('Error creating order:', error);
          res.status(500).json({ message: 'Server error while creating order' });
        }
      };