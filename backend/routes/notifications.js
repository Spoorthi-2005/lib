const express = require('express');
const router = express.Router();
const db = require('../database');

// Get Notifications for User
router.get('/:userId', (req, res) => {
    db.all("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", [req.params.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Mark as Read
router.put('/read/:id', (req, res) => {
    db.run("UPDATE notifications SET read = 1 WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Marked as read' });
    });
});

module.exports = router;
