const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./userRoutes.js'); // Replace with the correct path to your userRoutes file
const productRoutes = require('./productRoutes.js');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const jwtStrategy = require('passport-jwt').Strategy;
const extractJwt = require('passport-jwt').ExtractJwt;
const cors = require('cors');
const User = require('./models/User');
const db = require('./db')
const port = process.env.PORT || 4000;
const app = express();

const corsOptions = {
    origin: '*', // Replace '*' with specific origin(s) you want to allow
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };
  
// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const jwtOptions = {
    jwtFromRequest: extractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'abcdefghijklmnopqrstuvwxyz',
};

passport.use(
    new jwtStrategy(jwtOptions, async (payload, done) => {
        try {
            const user = await User.findById(payload._id);
            if (!user) {
                return done(null, false);
            }
            return done(null, user);
        } catch (error) {
            return done(error, false);
        }
    })
);

// Set up multer for handling file uploads


// Routes
app.use('/user', userRoutes);
app.use('/product',productRoutes)

// Start the server
db.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});