const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Product  = require('./models/Products'); // Replace with the correct path to your models
const passport = require('passport');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('./models/User')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });


router.post('/addProduct', upload.single('image'),  passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
      console.log("reaced");
      // Assuming you have user authentication and the user ID is available in req.user
      const userId = req.user._id;
      const newProduct = new Product({
        name: req.body.name,
        description: req.body.description,
        createdBy: userId,
        quantity: req.body.quantity || 0,
        price: req.body.price,
        image:{
          data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
          contentType: 'image/*'
        },
      });
      const savedProduct = await newProduct.save();
      console.log(savedProduct,'savedProduct');
      res.json(savedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

router.get('/products', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

router.post('/wishlist/add',passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {

      const { productId } = req.body;
      const userId = req.user._id;

      const user = await User.findById(userId);
      const product = await Product.findById(productId);
  
      if (!user || !product) {
        return res.status(200).json({success:false, error: 'User or product not found' });
      }
  
      // Check if the product is already in the wish list
      const isProductInWishlist = user.wishList.some((wishlistItem) => wishlistItem.product.equals(productId));
  
      if (isProductInWishlist) {
        return res.status(200).json({ success:false, error: 'Product is already in the wish list' });
      }
  console.log(user);
      // Add the product to the wish list
      user.wishList.push({ product: productId });
      await user.save();
  
      res.status(200).json({ success:true, message: 'Product added to wish list successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

router.post('/cart/add',passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user._id;
      // Check if the user and product exist
      const user = await User.findById(userId);
      const product = await Product.findById(productId);
      if (!user || !product) {
        return res.status(404).json({ error: 'User or product not found' });
      }
        // Check if the product is already in the cart
      const existingCartItem = user.addToCart.find((cartItem) => cartItem.product.equals(productId));
        if (existingCartItem) {
        // If the product is already in the cart, update the quantity
        existingCartItem.quantity += quantity || 1;
      } else {
        // If the product is not in the cart, add a new item
        user.addToCart.push({ product: productId, quantity: quantity || 1 });
      }
        // Save the updated user document
      await user.save();
        res.status(200).json({ message: 'Product added to cart successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
    

module.exports = router;