const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String },
  streetAddress: { type: String },
  landmark: { type: String },
  city: { type: String },
  pincode: { type: String },
  state: { type: String }
});

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  addresses: [addressSchema],
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = User;
