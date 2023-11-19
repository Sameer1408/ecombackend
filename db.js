const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://Sameer:beZdmx5TeDMLDV5@cluster0.rubvk.mongodb.net/shop?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error(`Error connecting to MongoDB: ${err.message}`);
});

module.exports = mongoose.connection;
