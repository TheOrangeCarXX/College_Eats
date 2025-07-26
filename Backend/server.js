const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

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

app.post('/signup', (req, res) => {
  const { email, username, password } = req.body;
  const sql = "INSERT INTO users (email, username, password) VALUES (?, ?, ?)";
  const values = [email, username, password];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).json({ error: 'Error creating user' });
    }
    console.log('User created successfully!');
    res.status(201).json({ message: 'User created successfully!' });
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});