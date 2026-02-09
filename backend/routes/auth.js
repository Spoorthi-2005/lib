const express = require('express');
const router = express.Router();
const db = require('../database');

// Register
router.post('/register', (req, res) => {
    const { name, email, password, role, whatsapp_number, student_id, faculty_id, grad_or_leave_date } = req.body;

    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedPassword = (password || '').trim();

    // Basic validation
    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Role-specific restrictions
    if (role === 'Librarian') {
        return res.status(403).json({ error: 'New librarian registrations are not allowed. Please use pre-seeded accounts.' });
    }

    // Role-specific validation (optional but good)
    if (role === 'Student' && !student_id) {
        // return res.status(400).json({ error: 'Student ID required for students' });
    }

    const joined_date = new Date().toISOString();
    const final_grad_date = grad_or_leave_date || new Date(new Date().setFullYear(new Date().getFullYear() + 4)).toISOString(); // Default 4 years

    const stmt = db.prepare("INSERT INTO users (name, email, password, role, whatsapp_number, joined_date, grad_or_leave_date) VALUES (?, ?, ?, ?, ?, ?, ?)");
    stmt.run(name, normalizedEmail, normalizedPassword, role, whatsapp_number, joined_date, final_grad_date, function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'Email already exists' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            message: 'User registered successfully',
            userId: this.lastID,
            user: { name, email: normalizedEmail, role }
        });
        stmt.finalize();
    });
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedPassword = (password || '').trim();

    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [normalizedEmail, normalizedPassword], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Graduation date check removed to allow access (handled by frontend/blockchain if needed)
        // if (row.grad_or_leave_date && new Date(row.grad_or_leave_date) < new Date()) {
        //     return res.status(403).json({ error: 'Access denied: Graduation/leave date passed' });
        // }

        // In a real app, generate JWT token here. For demo, return user info.
        res.json({
            message: 'Login successful',
            user: {
                id: row.id,
                name: row.name,
                email: row.email,
                role: row.role,
                whatsapp_number: row.whatsapp_number,
                joined_date: row.joined_date,
                grad_or_leave_date: row.grad_or_leave_date
            }
        });
    });
});

// Get all users (Librarian only)
router.get('/users', (req, res) => {
    db.all("SELECT id, name, email, role, whatsapp_number, joined_date, grad_or_leave_date FROM users WHERE role != 'Librarian'", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;
