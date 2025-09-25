const axios = require("axios");

let shiprocketToken = null;
let tokenExpiry = null; // To store the token expiration time

// Authenticate & get token
async function authenticateShiprocket() {
  // Check if the token exists AND is not expired
  const now = new Date();
  if (shiprocketToken && tokenExpiry && now < tokenExpiry) {
    return shiprocketToken;
  }

  try {
    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }
    );

    shiprocketToken = response.data.token;
    const expiresInMinutes = 14400 - 360; 
    tokenExpiry = new Date(now.getTime() + expiresInMinutes * 60000); 

    return shiprocketToken;
  } catch (error) {
    console.error("Shiprocket Auth Failed:", error.response?.data || error.message);
   throw new Error("Shiprocket authentication failed");
  }
}

async function createShiprocketOrder(order, shippingAddress, orderItems, paymentMethod, totalAmount, retry = 0) {
  try {
    const token = await authenticateShiprocket();

    const shiprocketOrder = {
  order_id: order._id.toString(),
  order_date: new Date().toISOString().slice(0, 10),
  pickup_location: "threadora", // ✅ use actual Shiprocket pickup location
  billing_customer_name: shippingAddress.name,
  billing_last_name: "",
  billing_address: shippingAddress.streetAddress,
  billing_address_2: shippingAddress.landmark || "", // ✅ include landmark
  billing_city: shippingAddress.city,
  billing_pincode: shippingAddress.pincode,
  billing_state: shippingAddress.state,
  billing_country: "India",
  billing_email: "customer@example.com",
  billing_phone: shippingAddress.phone,
  shipping_is_billing: true,
  order_items: orderItems.map((item) => ({
    name: item.productName,
    sku: item.productId?.toString() || "SKU-MISSING",
    units: item.quantity,
    selling_price: item.price,
  })),
  payment_method: paymentMethod === "Cash on Delivery" ? "COD" : "Prepaid",
  sub_total: totalAmount,
  length: 10,
  breadth: 10,
  height: 5,
  weight: 0.5,
};


    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      shiprocketOrder,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data;
  } catch (error) {
    if ((error.response?.status === 401 || error.response?.status === 403) && retry < 1) {
      console.log("Token expired or invalid, refreshing...");
      shiprocketToken = null;
      return createShiprocketOrder(order, shippingAddress, orderItems, paymentMethod, totalAmount, retry + 1);
    }

    console.error("Shiprocket Order Error:", error.response?.data || error.message);
    throw error;
  }
}



module.exports = {
  authenticateShiprocket,
  createShiprocketOrder
};
