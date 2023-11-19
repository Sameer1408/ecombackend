const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');

// Define the Product schema
const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdOn: { type: Date, default: Date.now },
  quantity: { type: Number, default: 0 },
  price: { type: Number, required: true },
  image: {
        data: Buffer,
        contentType: String
  }
});

// Create the Product model
const Product = mongoose.model('Product', productSchema);

module.exports = Product 