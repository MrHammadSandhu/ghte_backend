require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const app = express();

// Configure CORS
const allowedOrigins = [
  "https://www.gulfhorizontele.com", // Production frontend
  "http://127.0.0.1:5501", // Local frontend testing
];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow requests with valid origins
    } else {
      callback(new Error("Not allowed by CORS")); // Block other origins
    }
  },
  methods: ["GET", "POST", "OPTIONS"], // Allow specific methods
  allowedHeaders: ["Content-Type"], // Allow specific headers
};
app.use(cors(corsOptions));
app.use(express.json());

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
  res.send("Hello world");
});

// Email sending route
app.post("/api/send-email", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // Validate request body
  if (!name || !email || !phone || !subject || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Email HTML content
  const htmlContent = `
    <html>
      <body>
        <h1>New Product Inquiry</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
      </body>
    </html>
  `;

  try {
    // Send email
    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL,
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
