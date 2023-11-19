const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User  = require('./models/User'); // Replace with the correct path to your models

const router = express.Router();

// POST /api/register
router.post('/register', async (req, res) => {
  try {
    // Extract user input from the request body
    const { fullName, emailId, password } = req.body;
    console.log(req.body,"%%%%%%%");
    // Check if the user already exists
    const existingUser = await User.findOne({ emailId });

    if (existingUser) {
      return res.status(400).json({success:false,message: 'User already exists with this email address' });
    }

    const newUser = new User({
      fullName,
      emailId,
      password,
    });

    // Save the user to the database
    await newUser.save();
    // Create a JWT token
    const token = newUser.generateAuthToken();
    // Respond with the token
    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


router.post('/login', async (req, res) => {
    try {
        const { emailId, password } = req.body;
        console.log(emailId,password);
        const user = await User.findOne({ emailId });
        if (!user) {
           return res.status(200).json({success:false,message: 'Invalid email or password' });
        }

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            console.log("2")
            return res.status(200).json({success:false,message: 'Invalid email or password'});
        }

        // Generate a JWT token for the user
        const token = jwt.sign({ _id: user._id }, 'abcdefghijklmnopqrstuvwxyz'); // Replace with your own secret key

        res.status(200).json({success:true, message: 'Login successful', token ,user});
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;