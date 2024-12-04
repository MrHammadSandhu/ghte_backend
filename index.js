require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const app = express();
const cors = require("cors");
// Middleware to handle CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allow specific methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type"); // Allow specific headers

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(204).end(); // No content for preflight requests
    return;
  }

  next();
});
// Middleware to parse JSON
app.use(express.json());

// Configure CORS
const corsOptions = {
  origin: ["https://www.gulfhorizontele.com", "http://127.0.0.1:5501"], // Add local testing and production domains
  methods: ["GET", "POST", "OPTIONS"], // Include OPTIONS for preflight requests
  allowedHeaders: ["Content-Type"], // Specify allowed headers
};
app.use(cors(corsOptions)); // Enable CORS
app.options("*", cors(corsOptions)); // Handle preflight requests globally
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow all origins or restrict to specific domains
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail", // Gmail SMTP
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Default route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Email sending route
app.post("/api/send-email", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // Validate request body
  if (!name || !email || !phone || !subject || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Email content
  const htmlContent = `
    <h1>New Inquiry</h1>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong> ${message}</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.EMAIL, // Your email
      subject: `New Inquiry from ${name}`,
      html: htmlContent,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error.message);
    res
      .status(500)
      .json({ message: "Failed to send email", error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
