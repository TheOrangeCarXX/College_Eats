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
  const { email, username, password, phonenumber} = req.body;
  if (!email.endsWith('@iiitb.ac.in')) {
    return res.status(400).json({ error: 'Invalid email domain. Must be @iiitb.ac.in' });
  }
  const sql = "SELECT password FROM users WHERE email = ?";
  db.query(sql,[email], (err, results) => {
    if (err) {
      console.error('Database error during signup:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    if (results.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const sql2 = "SELECT password FROM users WHERE username = ?";
    db.query(sql2,[username], (err, results) => {
      if (err) { 
        console.error('Database error during signup:', err);
        return res.status(500).json({ error: 'Server error' });
      }
      if (results.length > 0) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    verificationData[email] = { username, password, code: verificationCode, phonenumber};
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
  const { username, password, phonenumber } = tempUser;
  const sql = "INSERT INTO users (email, username, password, phonenumber) VALUES (?, ?, ?, ?)";
  const values = [email, username, password, phonenumber];

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

app.get('/restaurants', (req, res) => {
  // This query now counts each occurrence of a name and groups them.
  const sql = `
    SELECT
        r.id AS id,
        r.name,
        COUNT(rm.user_id) AS count
    FROM
        restaurants r
    LEFT JOIN
        restaurant_members rm ON r.id = rm.restaurant_id
    GROUP BY
        r.id, r.name
    ORDER BY
        r.name ASC;
`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error fetching restaurants:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    res.status(200).json(results);
  });
});

// Add this route to handle creating a new restaurant

app.post('/restaurants/new', (req, res) => {
  // Get the restaurant name from the request body
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Restaurant name is required.' });
  }

  const sql = "INSERT INTO restaurants (name) VALUES (?)";

  db.query(sql, [name], (err, result) => {
    if (err) {
      // Handle potential duplicate entry error
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'This restaurant already exists.' });
      }
      console.error('Database error creating restaurant:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    
    // Send back a success message with the new restaurant's ID
    res.status(201).json({ message: 'Restaurant added successfully!', newId: result.insertId });
  });
});

app.get('/restaurants/:id/users', (req, res) => {
  const restaurantId = req.params.id; // Get the restaurant ID from the URL parameter

  // SQL query to fetch username, email, and phonenumber of users
  // who are members of the specified restaurant.
  const sql = `
    SELECT
        u.username,
        u.email,
        u.phonenumber
    FROM
        users u
    JOIN
        restaurant_members rm ON u.id = rm.user_id
    WHERE
        rm.restaurant_id = ?;
  `;

  db.query(sql, [restaurantId], (err, results) => {
    if (err) {
      console.error(`Database error fetching users for restaurant ${restaurantId}:`, err);
      return res.status(500).json({ error: 'Server error fetching interested users' });
    }
    res.status(200).json(results); // Send the fetched user data as JSON
  });
});

app.post('/restaurants/:id/join', (req, res) => {
  const restaurantId = req.params.id;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  // First, check if the user is already a member of this restaurant
  const checkSql = "SELECT COUNT(*) AS count FROM restaurant_members WHERE restaurant_id = ? AND user_id = ?";
  db.query(checkSql, [restaurantId, userId], (err, results) => {
    if (err) {
      console.error('Database error checking membership:', err);
      return res.status(500).json({ error: 'Server error checking membership' });
    }

    if (results[0].count > 0) {
      // User is already a member, send a 409 Conflict status
      return res.status(409).json({ error: 'You are already a member of this restaurant.' });
    }

    // If not a member, add the user to restaurant_members table
    const insertSql = "INSERT INTO restaurant_members (restaurant_id, user_id) VALUES (?, ?)";
    db.query(insertSql, [restaurantId, userId], (err, result) => {
      if (err) {
        console.error('Database error adding user to restaurant_members:', err);
        return res.status(500).json({ error: 'Server error adding you to the restaurant' });
      }
      res.status(201).json({ message: 'Successfully joined the restaurant!' });
    });
  });
});

app.delete('/restaurants/:id/leave', (req, res) => {
  const restaurantId = req.params.id;
  const { userId } = req.body; // Expecting userId from the frontend

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  // First, check if the user is actually a member of this restaurant
  const checkSql = "SELECT COUNT(*) AS count FROM restaurant_members WHERE restaurant_id = ? AND user_id = ?";
  db.query(checkSql, [restaurantId, userId], (err, results) => {
    if (err) {
      console.error('Database error checking membership before leaving:', err);
      return res.status(500).json({ error: 'Server error checking membership' });
    }

    if (results[0].count === 0) {
      // User is not a member, cannot leave
      return res.status(404).json({ error: 'You are not a member of this restaurant group.' });
    }

    // If user is a member, remove them from restaurant_members table
    const deleteSql = "DELETE FROM restaurant_members WHERE restaurant_id = ? AND user_id = ?";
    db.query(deleteSql, [restaurantId, userId], (err, result) => {
      if (err) {
        console.error('Database error removing user from restaurant_members:', err);
        return res.status(500).json({ error: 'Server error leaving the restaurant group' });
      }
      // Check if any row was actually affected
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Could not find and remove your membership.' });
      }
      res.status(200).json({ message: 'Successfully left the restaurant group!' });
    });
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});