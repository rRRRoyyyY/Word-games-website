const bcrypt = require('bcrypt');

require('dotenv').config();
const express = require('express'); // Loads the web server tool
const { Pool } = require('pg');    // Loads the database connector

const app = express();
app.use(express.json()); // Allows the server to read JSON from your frontend

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: process.env.DB_PASSWORD, // This pulls from the .env file
  port: process.env.DB_PORT,
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Scramble the password 10 times (the "Salt")
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Save the SCRAMBLED password, not the real one
    await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2)',
      [username, hashedPassword]
    );

    res.status(201).send("Secure Account Created! 🔒");
  } catch (err) {
    res.status(400).send("Username taken.");
  }
});

app.listen(3000);