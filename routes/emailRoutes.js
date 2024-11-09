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
      return res.status(400).json({ message: 'You are already subscribed' });  // Changed response message
    }

    // Register the new email
    const newEmail = new Email({ email });
    await newEmail.save();

    // Send the welcome email using the updated subject and body
    const subject = 'Welcome to RAME Store';
    const text = `
      Dear ${email},

      Welcome to RAME Store! We’re excited to have you join our community of passionate DJs and music enthusiasts.

      At RAME Store, we specialize in everything related to DJ gear and accessories, from top-of-the-line turntables and mixers to the latest audio equipment and lighting solutions. Our mission is to support your music journey with high-quality products and exclusive deals.

      By joining us, you’ll receive an amazing discount on our products, delivered right to your inbox. Stay tuned for more updates, exclusive offers, and the latest in DJ technology!

      Thank you for pre-registering. We can’t wait to help elevate your music experience.

      Best regards,
      The RAME Store Team
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
