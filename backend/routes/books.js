const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all books
router.get('/', (req, res) => {
    const { search } = req.query;
    let query = "SELECT * FROM books";
    let params = [];

    if (search) {
        query += " WHERE title LIKE ? OR author LIKE ? OR category LIKE ?";
        params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Add a book (Librarian only - validated in frontend, but could add middleware here)
router.post('/', (req, res) => {
    const { title, author, category, total_copies, image_url } = req.body;

    if (!title || !author) {
        return res.status(400).json({ error: 'Title and Author are required' });
    }

    const available_copies = total_copies;

    const stmt = db.prepare("INSERT INTO books (title, author, category, total_copies, available_copies, image_url) VALUES (?, ?, ?, ?, ?, ?)");
    stmt.run(title, author, category, total_copies, available_copies, image_url, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            message: 'Book added successfully',
            bookId: this.lastID
        });
        stmt.finalize();
    });
});

// Update book
router.put('/:id', (req, res) => {
    const { title, author, category, total_copies, available_copies, image_url } = req.body;
    const { id } = req.params;

    const stmt = db.prepare("UPDATE books SET title = ?, author = ?, category = ?, total_copies = ?, available_copies = ?, image_url = ? WHERE id = ?");
    stmt.run(title, author, category, total_copies, available_copies, image_url, id, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Book updated successfully' });
        stmt.finalize();
    });
});

// Delete book
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM books WHERE id = ?", id, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Book deleted successfully' });
    });
});

module.exports = router;
