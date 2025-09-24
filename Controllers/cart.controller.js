import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import { motion } from "framer-motion";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to view your cart.");
      navigate("/login");
      return;
    }
    try {
      const res = await fetch("https://jodiacbackend.onrender.com/api/cart", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
        console.log("Cart fetched successfully:", data.cart);
      } else {
        setError("Failed to fetch cart");
      }
    } catch (err) {
      setError("An error occurred while fetching the cart");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveItem(productId) {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found, please log in.");
      return;
    }

    try {
      const res = await fetch(
        "https://jodiacbackend.onrender.com/api/cart/remove",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId }),
        }
      );

      if (!res.ok) throw new Error("Failed to remove item");

      setCart((prevCart) => ({
        ...prevCart,
        products: prevCart.products.filter(
          (item) => item.productId?._id !== productId
        ),
      }));
    } catch (err) {
      setError(err.message);
    }
  }

  function calculateTotal() {
    return (
      cart?.products?.reduce(
        (acc, item) => acc + (item.productId?.price || 0) * item.quantity,
        0
      ) || 0
    );
  }

  function handleRedirect(item) {
    if (!item.productId) return;
    const selectedProductDetails = {
      productId: item.productId._id,
      name: item.productId.name,
      color: item.color,
      size: item.size,
      weight: item.Weight,
      quantity: item.quantity,
      price: item.productId.price,
      discount: item.productId.discount,
    };
    localStorage.setItem(
      "selectedProduct",
      JSON.stringify(selectedProductDetails)
    );
    navigate("/Shipping");
  }

  if (loading)
    return (
      <p className="flex justify-center items-center h-screen text-lg">
        Loading...
      </p>
    );
  if (error)
    return (
      <p className="text-center text-red-500 text-lg font-semibold">{error}</p>
    );

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200">
      <Navbar />
      <motion.h1
        className="text-4xl font-extrabold text-center mb-8 text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Your Cart
      </motion.h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Cart Summary */}
        <motion.div
          className="md:w-1/4 bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg h-fit border border-gray-200"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Cart Summary
          </h2>
          <ul className="text-gray-900 text-md space-y-2">
            {cart?.products?.map((item) => {
              const product = item.productId;
              if (!product) return null;
              return (
                <li key={item._id} className="flex justify-between">
                  <span>
                    {product.name} × {item.quantity}
                  </span>
                  <span className="font-semibold">
                    ₹{product.price * item.quantity}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-between text-lg font-bold text-gray-900 border-t pt-3 mt-4">
            <span>Total:</span>
            <span className="text-green-600">₹{calculateTotal()}</span>
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {cart?.products?.map((item) => {
            const product = item.productId;
            if (!product) return null;

            return (
              <motion.div
                key={item._id}
                className="bg-white/80 backdrop-blur-lg border rounded-2xl shadow-md p-4 hover:shadow-2xl transition-all duration-300"
                whileHover={{ scale: 1.05, rotateY: 3 }}
              >
                {/* Image */}
                <motion.img
                  src={product.images?.[0] || "/placeholder.jpg"}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-xl mb-3 cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  onClick={() => navigate(`/productPage/${product._id}`)}
                />

                {/* Name */}
                <h2
                  className="text-lg font-semibold cursor-pointer hover:underline"
                  onClick={() => navigate(`/productPage/${product._id}`)}
                >
                  {product.name}
                </h2>

                {/* Price */}
                <div className="flex items-center justify-between mt-2">
                  <p className="text-red-500 font-bold">₹{product.price}</p>
                  {product.oldPrice && (
                    <p className="text-gray-500 line-through text-sm">
                      ₹{product.oldPrice}
                    </p>
                  )}
                </div>

                {/* Extra Details */}
                <div className="mt-3 text-sm text-gray-700 space-y-1">
                  <p>
                    <span className="font-medium">Quantity:</span>{" "}
                    {item.quantity}
                  </p>
                  <p>
                    <span className="font-medium">Size:</span>{" "}
                    {item.size || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Color:</span>{" "}
                    {item.color || "-"}
                  </p>
                </div>

                {/* Actions */}
                <motion.button
                  onClick={() => handleRemoveItem(product._id)}
                  className="w-full bg-red-500 text-white py-3 mt-4 rounded-lg font-semibold shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Remove Item
                </motion.button>
                <motion.button
                  onClick={() => handleRedirect(item)}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white py-3 mt-4 rounded-lg font-semibold shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Proceed to Checkout
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default Cart;
