const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Contact = require('../models/Contact'); // Import the Contact model

// POST /contact - Handle contact form submissions
router.post('/', async (req, res) => {
  try {
    const { name, lastName, email, message } = req.body;

    // Validate input
    if (!name || !lastName || !email || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    console.log('New contact form submission:', { name, lastName, email, message });

    // Save to database
    const contact = new Contact({ name, lastName, email, message });
    await contact.save();

    // Configure email notification
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Use environment variables for sensitive data
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender email
      to: 'contact.ramestore@gmail.com', // Recipient email
      subject: 'New Contact Form Submission',
      text: `You have a new message from ${name} ${lastName} (${email}):\n\n${message}`,
    };

    // Send email notification
    await transporter.sendMail(mailOptions);

    // Respond with success
    res.status(200).json({ message: 'Message received successfully!' });
  } catch (err) {
    console.error('Error handling contact form submission:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
