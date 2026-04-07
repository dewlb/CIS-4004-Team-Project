// Quick script to check a user's role in the database
const mongoose = require('mongoose');
const User = require('./server/models/User');

const username = process.argv[2] || 'emily9351';
const MONGO_URI = 'mongodb+srv://ethanjewell04_db_user:oXk75FTDe3YtmqVe@users.1ddqyy7.mongodb.net/?appName=Users';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log(`User "${username}" not found`);
    } else {
      console.log('User found:');
      console.log('  Username:', user.username);
      console.log('  Role:', user.role);
      console.log('  ID:', user._id);
      console.log('  First Name:', user.firstName);
      console.log('  Last Name:', user.lastName);
    }
    
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
