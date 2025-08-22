const db = require("../models/Index.model");
const User = db.user;
const mongoose = require("mongoose");

// Add Address
exports.Addaddress = async (req, res) => {
  try {
     const userId = req.userId; 
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, phone, streetAddress, landmark, city, pincode, state } = req.body;

    // Basic validation
    if (!name || !phone || !streetAddress || !city || !pincode || !state) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    const newAddress = {
      _id: new mongoose.Types.ObjectId(),  // so you can later delete or update this address by id
      name,
      phone,
      streetAddress,
      landmark,
      city,
      pincode,
      state
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(200).json({ message: "Address added successfully!", address: newAddress });
  } catch (error) {
    res.status(500).json({ message: "Error adding address", error: error.message });
  }
};

// Get Addresses
exports.Getaddress = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving addresses", error: error.message });
  }
};
