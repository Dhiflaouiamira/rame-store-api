require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const emailRoutes = require('./routes/emailRoutes');
const Email = require('./models/Email'); // Import the Email model

const app = express();
app.use(express.json());
app.use(cors());

const dburl = process.env.dburl;
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(dburl)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Exit the process if MongoDB connection fails
    });

// Routes
app.use('/api/emails', emailRoutes);

// Function to notify users
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function notifyUsers() {
    try {
        const users = await Email.find({});
        for (const user of users) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Nos produits électroniques sont prêts!',
                text: 'Nos nouveaux produits électroniques sont prêts. Visitez notre site pour en savoir plus!'
            });
        }
        console.log('Notification sent to all users');
    } catch (error) {
        console.error('Error notifying users:', error);
    }
}

// Uncomment to manually trigger notifications
// notifyUsers();
