const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

const DB_PATH = path.join(__dirname, 'contacts.sqlite');

app.use(bodyParser.json());

// Connect to SQLite DB
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) return console.error('❌ DB connection error:', err);
  console.log('✅ Connected to SQLite database');
});

// Create contacts table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT
  )
`);

// CREATE contact
app.post('/api/contacts', (req, res) => {
  const { first_name, last_name, email, phone, message } = req.body;

  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'first_name, last_name, and email are required.' });
  }

  const query = `INSERT INTO contacts (first_name, last_name, email, phone, message) VALUES (?, ?, ?, ?, ?)`;
  const values = [first_name, last_name, email, phone, message];

  db.run(query, values, function (err) {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({
      id: this.lastID,
      first_name,
      last_name,
      email,
      phone,
      message
    });
  });
});

// READ all contacts
app.get('/api/contacts', (req, res) => {
  db.all(`SELECT * FROM contacts`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
