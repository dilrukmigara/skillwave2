import express from 'express';
import cors from 'cors';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

// Database configuration
const MONGODB_URI = process.env.MONGODB_URI;
let dbClient = null;
let useMongo = false;
let mongoDb = null;
let sqliteDb = null;

if (MONGODB_URI) {
  try {
    console.log('Connecting to hosted MongoDB...');
    dbClient = new MongoClient(MONGODB_URI);
    await dbClient.connect();
    mongoDb = dbClient.db();
    useMongo = true;
    console.log('Successfully connected to hosted MongoDB!');
  } catch (err) {
    console.error('Failed to connect to MongoDB, falling back to SQLite:', err);
    useMongo = false;
  }
}

if (!useMongo) {
  console.log('Initializing local SQLite database (database.db)...');
  const dbPath = path.resolve(__dirname, 'database.db');
  sqliteDb = new DatabaseSync(dbPath);
  
  // Create table if not exists
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_type TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// API to submit form
app.post('/api/submissions', async (req, res) => {
  const { form_type, name, phone, email, message } = req.body;

  if (!form_type || !name || !phone) {
    return res.status(400).json({ error: 'form_type, name and phone are required fields.' });
  }

  try {
    if (useMongo) {
      const collection = mongoDb.collection('submissions');
      await collection.insertOne({
        form_type,
        name,
        phone,
        email: email || '',
        message: message || '',
        created_at: new Date().toISOString()
      });
    } else {
      const insertStmt = sqliteDb.prepare(`
        INSERT INTO submissions (form_type, name, phone, email, message)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertStmt.run(form_type, name, phone, email || '', message || '');
    }
    return res.status(201).json({ success: true, message: 'Submission saved successfully.' });
  } catch (err) {
    console.error('Error inserting submission:', err);
    return res.status(500).json({ error: 'Database error occurred.' });
  }
});

// API to list all submissions (admin dashboard)
app.get('/api/submissions', async (req, res) => {
  try {
    let submissions = [];
    if (useMongo) {
      const collection = mongoDb.collection('submissions');
      const docs = await collection.find({}).sort({ _id: -1 }).toArray();
      submissions = docs.map(doc => ({
        id: doc._id.toString(),
        form_type: doc.form_type,
        name: doc.name,
        phone: doc.phone,
        email: doc.email,
        message: doc.message,
        created_at: doc.created_at
      }));
    } else {
      const selectStmt = sqliteDb.prepare(`
        SELECT * FROM submissions ORDER BY id DESC
      `);
      submissions = selectStmt.all();
    }
    return res.json(submissions);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    return res.status(500).json({ error: 'Database error occurred.' });
  }
});

// API to delete a submission
app.post('/api/submissions/delete', async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Submission ID is required.' });
  }

  try {
    if (useMongo) {
      const collection = mongoDb.collection('submissions');
      let query = {};
      if (ObjectId.isValid(id)) {
        query = { _id: new ObjectId(id) };
      } else {
        query = { _id: id };
      }
      await collection.deleteOne(query);
    } else {
      const deleteStmt = sqliteDb.prepare(`
        DELETE FROM submissions WHERE id = ?
      `);
      deleteStmt.run(id);
    }
    return res.json({ success: true, message: 'Submission deleted.' });
  } catch (err) {
    console.error('Error deleting submission:', err);
    return res.status(500).json({ error: 'Database error occurred.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
