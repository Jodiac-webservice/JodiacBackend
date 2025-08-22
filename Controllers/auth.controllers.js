require("dotenv").config();
const config = require("../config/auth.config");
const db = require("../models/index.model");
const User = db.user;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");


exports.signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
    });

    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, config.secret, {
      expiresIn: "24h",
    });
    await sendWelcomeEmail(email, name);
    res.status(201).json({
      accessToken: token,
      message: "User registered successfully!",
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Something went wrong during registration." });
  }
};


const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

const mailOptions = {
  from: '"Niladri Howladar | Founder, Jodiac" <niladrihowladar2@gmail.com>',
  to: email,
  subject: "Welcome to Jodiac 💛 | Let’s Create Magic Together",
  html: `
    <div style="font-family: Arial, sans-serif; color: #2c3e50; line-height: 1.6;">
      <h2 style="color: #2c3e50;">Welcome to Jodiac ⚡</h2>
      <p>Hey <strong>${name}</strong>!</p>
      
      <p>I'm <strong>Niladri Howladar</strong> — the face behind <strong>Jodiac</strong>, and guess what? You just joined a vibe you won’t want to miss. 🚀</p>
      
      <p>We’re so hyped to have you on board, <strong>${email}</strong>! This is where bold ideas meet dope design. Creativity? Unlocked. Imagination? Unleashed. ✨</p>
      
      <p>While we’re gearing up for our official drops, just know the squad is working behind-the-scenes — curating, crafting, and cooking up some next-level magic. 🔥</p>
      
      <p>Jodiac isn’t just a brand — it’s a movement. A space where creators, dreamers, and visionaries come together to break the mold and vibe without limits. 💛</p>
      
      <p>You’re not just a subscriber — you’re part of the fam now. Let’s build something unforgettable. Tap in, stay tuned, and get ready to shine.🛸</p>

      <br>

      <p>With big energy & good vibes,</p>
      <p><strong>Niladri Howladar</strong><br>
      Founder, Jodiac ⚡<br>
      #StayBold #BeLimitless</p>
    </div>
  `,
};
    
    await transporter.sendMail(mailOptions);
    console.log("Signup email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error.message || error);
  }
};
exports.signin = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const user = await User.findOne({email});

    if (!user) {
      return res.status(400).send({ message: "User not found." });
    }
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid password!"
      });
    }

    const token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400
    });

    res.status(200).send({
      id: user._id,
      email: user.email,
      name: user.name,
      accessToken: token,
    });
  } catch (err) {
    console.error("Error during signin:", err);
    res.status(500).send({ message: err.message || "An error occurred during signin." });
  }
};
exports.getusers =async(req,res)=>{
  const userId = req.userId; 
  try{
    const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
} catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Server error' });
};
};

