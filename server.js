import express from 'express';
import cors from 'cors';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

// Initialize SQLite database Sync
const dbPath = path.resolve(__dirname, 'database.db');
const db = new DatabaseSync(dbPath);

// Create table if not exists
db.exec(`
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

// API to submit form
app.post('/api/submissions', (req, res) => {
  const { form_type, name, phone, email, message } = req.body;

  if (!form_type || !name || !phone) {
    return res.status(400).json({ error: 'form_type, name and phone are required fields.' });
  }

  try {
    const insertStmt = db.prepare(`
      INSERT INTO submissions (form_type, name, phone, email, message)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    insertStmt.run(form_type, name, phone, email || '', message || '');
    return res.status(201).json({ success: true, message: 'Submission saved successfully.' });
  } catch (err) {
    console.error('Error inserting submission:', err);
    return res.status(500).json({ error: 'Database error occurred.' });
  }
});

// API to list all submissions (admin dashboard)
app.get('/api/submissions', (req, res) => {
  try {
    const selectStmt = db.prepare(`
      SELECT * FROM submissions ORDER BY id DESC
    `);
    const submissions = selectStmt.all();
    return res.json(submissions);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    return res.status(500).json({ error: 'Database error occurred.' });
  }
});

// API to delete a submission
app.post('/api/submissions/delete', (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Submission ID is required.' });
  }

  try {
    const deleteStmt = db.prepare(`
      DELETE FROM submissions WHERE id = ?
    `);
    deleteStmt.run(id);
    return res.json({ success: true, message: 'Submission deleted.' });
  } catch (err) {
    console.error('Error deleting submission:', err);
    return res.status(500).json({ error: 'Database error occurred.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
