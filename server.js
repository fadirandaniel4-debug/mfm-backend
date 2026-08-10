const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Database setup
const db = new Database(path.join(__dirname, "data", "mfm.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    phone TEXT,
    subject TEXT,
    message TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS prayer_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS event_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    phone TEXT,
    event_name TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount TEXT,
    purpose TEXT,
    name TEXT,
    email TEXT,
    phone TEXT,
    prayer_request TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// ---- ROUTES ----

// Contact form
app.post("/api/contact", (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }
  const stmt = db.prepare(
    "INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)"
  );
  stmt.run(name, email, phone, subject, message);
  res.json({ success: true, message: "Message received." });
});

// Prayer request
app.post("/api/prayer-request", (req, res) => {
  const { request } = req.body;
  if (!request) {
    return res.status(400).json({ error: "Prayer request cannot be empty." });
  }
  const stmt = db.prepare("INSERT INTO prayer_requests (request) VALUES (?)");
  stmt.run(request);
  res.json({ success: true, message: "Prayer request received." });
});

// Event registration
app.post("/api/events/register", (req, res) => {
  const { name, email, phone, event, notes } = req.body;
  if (!name || !email || !event) {
    return res.status(400).json({ error: "Name, email, and event are required." });
  }
  const stmt = db.prepare(
    "INSERT INTO event_registrations (name, email, phone, event_name, notes) VALUES (?, ?, ?, ?, ?)"
  );
  stmt.run(name, email, phone, event, notes);
  res.json({ success: true, message: "Registration received." });
});

// Donation (UI only — no real payment processing yet)
app.post("/api/donations", (req, res) => {
  const { amount, purpose, name, email, phone, prayerRequest } = req.body;
  if (!amount || !purpose) {
    return res.status(400).json({ error: "Amount and purpose are required." });
  }
  const stmt = db.prepare(
    "INSERT INTO donations (amount, purpose, name, email, phone, prayer_request) VALUES (?, ?, ?, ?, ?, ?)"
  );
  stmt.run(amount, purpose, name, email, phone, prayerRequest);
  res.json({ success: true, message: "Donation recorded (payment provider not yet connected)." });
});

// Newsletter subscribe
app.post("/api/subscribe", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }
  try {
    const stmt = db.prepare("INSERT INTO newsletter_subscribers (email) VALUES (?)");
    stmt.run(email);
    res.json({ success: true, message: "Subscribed." });
  } catch (err) {
    res.status(400).json({ error: "Email already subscribed." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});