const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail", // Or your email service provider
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});
app.get("/", (req, res) => {
  res.send("Hello world");
});
// API Route for sending email
app.post("/api/send-email", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // Validation
  if (!name || !email || !phone || !subject || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // HTML Email Template
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Product Inquiry</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        color: #333;
      }
      .email-container {
        max-width: 600px;
        margin: auto;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        background-color: #01ae47;
        color: #fff;
        text-align: center;
        padding: 20px;
      }
      .content {
        padding: 20px;
      }
      .content h2 {
        color: #01ae47;
        margin-top: 0;
      }
      .details {
        padding: 10px;
        background-color: #f9f9f9;
        border-radius: 5px;
      }
      .details p {
        margin: 5px 0;
      }
      .footer {
        text-align: center;
        padding: 10px;
        background-color: #f4f4f4;
        font-size: 12px;
        color: #777;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>New Product Inquiry</h1>
      </div>
      <div class="content">
        <h2>Details:</h2>
        <div class="details">
          <p><strong>User Name:</strong> ${name}</p>
          <p><strong>Email Address:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Phone Number:</strong> ${phone}</p>
          <p><strong>Message:</strong> ${message}</p>
        </div>
      </div>
      <div class="footer">
        <p>&copy; 2024 Gulf Horizon Telecom. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;

  // Sending Email
  try {
    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL,
      subject: "New Product Inquiry",
      html: htmlContent,
    });

    res.status(200).json({ message: "Email sent successfully to admin!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));