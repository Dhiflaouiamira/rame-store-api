const express = require('express');
const router = express.Router();
const Email = require('../models/Email');
const nodemailer = require('nodemailer');

// Set up the transporter for Gmail service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  logger: true,   // To log email activity
  debug: true      // For debugging email issues
});

// Function to send an email (confirmation)
function sendEmail({ recipient_email, subject, text }) {
  return new Promise((resolve, reject) => {
    const mail_configs = {
      from: process.env.EMAIL_USER,    // Sender's email
      to: recipient_email,             // Recipient's email
      subject: subject,                // Subject of the email
      text: text                       // Email body
    };

    // Send the email
    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log(error);
        return reject({ message: "Failed to send email" });
      }
      resolve({ message: 'Email sent successfully', info });
    });
  });
}

// Route to register an email and send confirmation
router.post('/', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email is already registered
    const existingEmail = await Email.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'You are already subscribed' });
    }

    // Extract the user's name from the email
    const userName = email.split('@')[0];

    // Register the new email
    const newEmail = new Email({ email });
    await newEmail.save();

    // Send the welcome email with the updated content
    const subject = 'Welcome to RAME STORE – Let’s Get Started with 10% Off!';
    const text = `
      Welcome to RAME STORE – Let’s Get Started with 10% Off!
      
      Dear ${userName},
      
      Welcome to the RAME STORE! We’re thrilled to have you on our mailing list and look forward to providing you with the best in music and collectibles.

      As a token of our appreciation, enjoy 10% off your first purchase with us.
      
      You will be notified of our:
      
      - Upcoming Products and Pop Up Shops: Be the first to know about our new and exclusive products dropping soon and updates about our Pop Up shops.
      
      - In-Stock Records: Browse through our wide selection of records, including classics and contemporary hits, all ready to ship.
      
      Stay tuned for updates, special offers, and handpicked recommendations tailored just for you.

      If you have any questions or need assistance, feel free to reach out to us at:
      - Phone: +216 29 050 348
      - Email: contact@ramestore.com
      
      Happy shopping,
      The RAME STORE Team
    `;

    sendEmail({ recipient_email: email, subject, text })
      .then((response) => {
        console.log(response.message);
        res.status(201).json({ message: 'Email registered and confirmation sent' });
      })
      .catch((error) => {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send confirmation email', error });
      });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'An error occurred', error });
  }
});

module.exports = router;