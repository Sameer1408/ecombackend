const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Define the User schema
const userSchema = new Schema({
  fullName: { type: String, required: true },
  emailId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  addToCart: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, default: 1 },
    }
  ],
  wishList: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    }
  ],
});

userSchema.pre('save', async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, 'abcdefghijklmnopqrstuvwxyz'); // Replace with your own secret key
    return token;
  };

// Create the Product model
const User = mongoose.model('User', userSchema);

module.exports = User;