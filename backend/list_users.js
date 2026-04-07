const mongoose = require('mongoose');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
});

const User = mongoose.model('User', UserSchema);

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const users = await User.find({}, 'name email');
        console.log('Registered Users:');
        console.log(JSON.stringify(users, null, 2));
        
        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

listUsers();
