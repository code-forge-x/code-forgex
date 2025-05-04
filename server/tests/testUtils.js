const mongoose = require('mongoose');

const setupTestDatabase = async () => {
  // Connect to test database
  const testDbUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/template-management-test';
  
  await mongoose.connect(testDbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  });

  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
};

const cleanupTestDatabase = async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }

  // Close connection
  await mongoose.connection.close();
};

module.exports = {
  setupTestDatabase,
  cleanupTestDatabase
}; 