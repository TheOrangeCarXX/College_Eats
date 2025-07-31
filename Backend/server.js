const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

app.use(cors());

app.use(express.json());


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'college_eats'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err);
    return;
  }
  console.log('✅ Connected to MySQL database "college_eats"');
});

// --- Nodemailer Setup ---
// This part handles sending emails and is separate from the database.
// Remember to use your real email and an App Password if you get it working.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'collegeeatsxx@gmail.com',
    pass: 'cayl uyud okiq pudc'
  }
});

// Temporary storage for verification codes.
const verificationData = {};


// --- Routes that interact with your database ---

// This route DOES NOT interact with the database. It only sends an email.
app.post('/signup', (req, res) => {
  const { email, username, password } = req.body;

  if (!email.endsWith('@iiitb.ac.in')) {
    return res.status(400).json({ error: 'Invalid email domain. Must be @iiitb.ac.in' });
  }
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  verificationData[email] = { username, password, code: verificationCode };
  const mailOptions = {
      from: 'collegeeatsxx@gmail.com',
      to: email,
      subject: 'College Eats - Email Verification',
      text: `Your verification code is: ${verificationCode}`
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      // --- DEBUGGING STEP ---
      // This will print the detailed error from Nodemailer to your server console.
      console.error('Nodemailer Error:', error); 
      return res.status(500).json({ error: 'Failed to send verification email.' });
    }
    res.status(200).json({ message: 'Verification email sent.' });
  });
});

// This route DOES interact with your database.
app.post('/verify', (req, res) => {
  const { email, code } = req.body;
  const tempUser = verificationData[email];

  if (!tempUser || tempUser.code !== code) {
    return res.status(400).json({ error: 'Invalid verification code.' });
  }

  // If the code is correct, it runs a SQL query to INSERT the new user
  // into the 'users' table in your 'college_eats' database.
  const { username, password } = tempUser;
  const sql = "INSERT INTO users (email, username, password) VALUES (?, ?, ?)";
  const values = [email, username, password];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).json({ error: 'Error creating user' });
    }
    delete verificationData[email];
    res.status(201).json({ message: 'User created successfully!' });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT id, email, username, password FROM users WHERE username = ?";
  
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error('Database error during login:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = results[0];

    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    res.status(200).json({ 
        message: 'Login successful!',
        user: {
            id: user.id,
            email: user.email,
            username: user.username
        } 
    });
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});