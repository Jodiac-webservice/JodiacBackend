const db = require("../models/Index.model");
const Cart = db.Cart;
const Product = db.product;

exports.AddToCart = async (req, res) => {
  const userId = req.userId;
  const { productId, quantity, size, color, Weight } = req.body;
  if (!productId || !quantity) {
    return res.status(400).send({ message: "ProductId and quantity are required" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        products: [
          {
            productId,
            quantity,
            size,
            color,
            Weight,
          },
        ],
      });
    } else {
      const productIndex = cart.products.findIndex(
        (p) => p.productId.toString() === productId
      );

      if (productIndex > -1) {
        cart.products[productIndex].quantity += quantity;
        cart.products[productIndex].size = size;
        cart.products[productIndex].color = color;
        cart.products[productIndex].Weight = Weight;
      } else {
        cart.products.push({
          productId,
          quantity,
          size,
          color,
          Weight,
        });
      }
    }
    await cart.save();
    res.status(200).send({
      message: "Product added to cart",
      cart,
    });
  } catch (err) {
    console.error("Error adding product to cart:", err);
    res.status(500).send({
      message: err.message || "An error occurred while adding the product to cart",
    });
  }
};

  
exports.getCart = async (req, res) => {
    try {
      const cart = await Cart.findOne({ userId: req.userId }).populate('products.productId');
      if (!cart) return res.status(404).send({ message: 'Cart not found' });
      res.status(200).send({ cart });
    } catch (err) {
      res.status(500).send({ message: 'Error fetching cart' });
    }
  };
  exports.RemoveFromCart = async (req, res) => {
    const userId = req.userId; 
    const { productId } = req.body;

    try {
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).send({ message: 'Cart not found' });
        }

        const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).send({ message: 'Product not found in cart' });
        }

        cart.products.splice(productIndex, 1);

        if (cart.products.length === 0) {
            await Cart.deleteOne({ userId });
        } else {
            await cart.save();
        }

        res.status(200).send({ message: 'Product removed from cart', cart });
    } catch (err) {
        res.status(500).send({ message: err.message || 'An error occurred while removing the product from the cart.' });
    }
};