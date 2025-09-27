const db = require("../models/index.model");
const Product = db.Product;

exports.Addproduct = async (req, res) => {
    try {
        const { name, description,category} = req.body;

        if (!name || !description || !category || !req.files || req.files.length === 0) {
            return res.status(400).json({ error: "All fields, including at least one image, are required" });
        }
        const images = req.files.map(file => file.path);

        const newProduct = new Product({
            name,
            description,
            category,
            images,
        });
        const savedProduct = await newProduct.save();

        res.status(201).json({
            message: 'Product uploaded successfully',
            product: savedProduct
        });
    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};
exports.updateproduct = async (req, res) => {
    try {
        const { id, name, description } = req.body;

        console.log("ID from req.body:", id);

        if (!id) {
            return res.status(400).json({ error: "Product ID is required" });
        }
        let product = await Product.findById(id);

        console.log("Product found:", product);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        if (name) product.name = name;
        if (description) product.description = description;
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path);
            product.images.push(...newImages); 
        }
        const updatedProduct = await product.save();

        res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.AddProductDetails = async (req, res) => {
    try {
        const { 
            _id, 
            price, 
            oldPrice, 
            rating, 
            reviews, 
            discount,
            color,
            size,
            weight
        } = req.body;

        const product = await Product.findById(_id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.price = price || product.price;
        product.oldprice = oldPrice || product.oldprice;
        product.rating = rating || product.rating;
        product.reviews = reviews || product.reviews;
        product.discount = discount || product.discount;
        product.color = color || product.color;
        product.size = size || product.size;
        product.weight = weight || product.weight;

        await product.save();
        res.status(200).json({ message: "Product updated successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getProduct = async (req,res) => {
try{
    const products = await Product.find();
    res.json(products);
} catch(error){
    res.status(500).json({message:error.message})
};
}

exports.FindProductById = async (req , res) =>{
    try{
        const product =await Product.findById(req.params.id);
        if(!product) {
            return res.status(404).json({message:'product not found'});
        }
        res.status(200).json({product})
    }catch(error){
        res.status(500).json({message:error.message})
    }
}
exports.getsimilerProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      const similarProducts = await Product.find({
        category: product.category,
        _id: { $ne: id },
      });
  
      res.json({
        product,
        similarProducts,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  