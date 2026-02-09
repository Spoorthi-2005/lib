const express = require('express');
const router = express.Router();
const db = require('../database');
const { sendWhatsAppMessage } = require('../utils/whatsapp');

// Check Eligibility
router.get('/check-eligibility/:userId/:bookId', (req, res) => {
    const { userId, bookId } = req.params;

    // Get User Role and Issued Books count
    db.get("SELECT role FROM users WHERE id = ?", [userId], (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User not found' });

        db.get("SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND type = 'ISSUE' AND return_date IS NULL", [userId], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });

            const count = row.count;
            let limit = 0;
            if (user.role === 'Student') limit = 3;
            if (user.role === 'Faculty') limit = 5;

            if (count >= limit) {
                return res.json({ eligible: false, message: `Borrow limit reached! ${user.role}s can issue only ${limit} books.` });
            }
            res.json({ eligible: true });
        });
    });
});

// Record Issue
router.post('/issue', (req, res) => {
    const { user_id, book_id, tx_hash, block_number, gas_used } = req.body;

    // Validate inputs
    if (!user_id || !book_id || !tx_hash) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Default 14 days for now, but should depend on role. 
    // We can fetch role again or pass it. Fetching is safer.
    db.get("SELECT role, whatsapp_number, name FROM users WHERE id = ?", [user_id], (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User not found' });

        let days = user.role === 'Faculty' ? 30 : 14;
        const issueDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(issueDate.getDate() + days);

        const stmt = db.prepare(`INSERT INTO transactions 
            (user_id, book_id, type, issue_date, due_date, tx_hash, block_number, gas_used)
            VALUES (?, ?, 'ISSUE', ?, ?, ?, ?, ?)`);

        stmt.run(user_id, book_id, issueDate.toISOString(), dueDate.toISOString(), tx_hash, block_number, gas_used, function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // Decrement book copies
            db.run("UPDATE books SET available_copies = available_copies - 1 WHERE id = ?", [book_id]);

            // Send WhatsApp
            db.get("SELECT title, author FROM books WHERE id = ?", [book_id], (err, book) => {
                const bookTitle = book ? book.title : 'Book';
                const bookAuthor = book ? book.author : 'Unknown';
                const message = `🌟 *Library Issue Confirmed!*\n\n` +
                    `Hello *${user.name}*,\n\n` +
                    `You have successfully issued:\n` +
                    `📖 *${bookTitle}*\n` +
                    `✍️ *${bookAuthor}*\n\n` +
                    `📅 *Due Date:* ${dueDate.toLocaleDateString()}\n\n` +
                    `💡 _Reminder:_ Please return the book on time to avoid fines (${user.role === 'Faculty' ? '₹5' : '₹2'}/day). ` +
                    `A courtesy reminder will be sent on day ${user.role === 'Faculty' ? '30' : '13'}.\n\n` +
                    `Thank you for using our Library! 📚✨`;
                sendWhatsAppMessage(user.whatsapp_number, message, user_id);
            });

            res.json({ message: 'Issue recorded successfully', transactionId: this.lastID });
            stmt.finalize();
        });
    });
});

// Record Return
router.post('/return', (req, res) => {
    const { user_id, book_id, fine_amount, tx_hash, block_number, gas_used } = req.body;

    const returnDate = new Date().toISOString();

    // Find the open transaction
    db.get("SELECT * FROM transactions WHERE user_id = ? AND book_id = ? AND type = 'ISSUE' AND return_date IS NULL ORDER BY issue_date DESC LIMIT 1", [user_id, book_id], (err, tx) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!tx) return res.status(404).json({ error: 'No active issue record found' });

        // Calculate Fine if not provided
        let finalFine = fine_amount || 0;
        const now = new Date();
        const dueDate = new Date(tx.due_date);

        if (!fine_amount && now > dueDate) {
            const diffTime = Math.abs(now - dueDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Get user role for accurate fine calculation
            db.get("SELECT role, whatsapp_number FROM users WHERE id = ?", [user_id], (err, user) => {
                const rate = user.role === 'Faculty' ? 5 : 2;
                finalFine = diffDays * rate;

                processReturn(tx, user, finalFine, returnDate, tx_hash, block_number, gas_used, res);
            });
        } else {
            db.get("SELECT role, whatsapp_number FROM users WHERE id = ?", [user_id], (err, user) => {
                processReturn(tx, user, finalFine, returnDate, tx_hash, block_number, gas_used, res);
            });
        }
    });

    function processReturn(tx, user, fine, returnDate, tx_hash, block_number, gas_used, res) {
        // 1. Update previous issue to set return_date
        db.run("UPDATE transactions SET return_date = ? WHERE id = ?", [returnDate, tx.id]);

        // 2. Insert new RETURN record
        const stmt = db.prepare(`INSERT INTO transactions 
            (user_id, book_id, type, issue_date, return_date, fine_amount, tx_hash, block_number, gas_used)
            VALUES (?, ?, 'RETURN', ?, ?, ?, ?, ?, ?)`);

        stmt.run(user_id, book_id, tx.issue_date, returnDate, fine, tx_hash, block_number, gas_used, function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // Increment book copies
            db.run("UPDATE books SET available_copies = available_copies + 1 WHERE id = ?", [book_id]);

            // Send WhatsApp
            db.get("SELECT title FROM books WHERE id = ?", [book_id], (err, book) => {
                const bookTitle = book ? book.title : 'Book';
                const message = `✅ *Library Return Confirmed!*\n\n` +
                    `You have returned: *${bookTitle}*\n` +
                    `💰 *Fine Applied:* ₹${fine}\n` +
                    `🔗 *Receipt ID:* ${tx_hash.substring(0, 10)}...\n\n` +
                    `Thank you for your timely return. Visit the library again soon! 📚`;
                if (user) sendWhatsAppMessage(user.whatsapp_number, message, user_id);
            });

            res.json({ message: 'Return recorded successfully', transactionId: this.lastID, fine_amount: fine });
            stmt.finalize();
        });
    }
});

// Get User History
router.get('/history/:userId', (req, res) => {
    db.all("SELECT t.*, b.title, b.author FROM transactions t JOIN books b ON t.book_id = b.id WHERE t.user_id = ? ORDER BY t.issue_date DESC", [req.params.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get All Transactions (Librarian only)
router.get('/all', (req, res) => {
    const query = `
        SELECT t.*, b.title, b.author, u.name as user_name 
        FROM transactions t 
        JOIN books b ON t.book_id = b.id 
        JOIN users u ON t.user_id = u.id 
        ORDER BY t.issue_date DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get Analytics (Librarian only)
router.get('/analytics', (req, res) => {
    const stats = {
        totalBooks: 0,
        totalStock: 0,
        activeIssues: 0,
        totalFines: 0,
        totalUsers: 0
    };

    db.get("SELECT COUNT(*) as count FROM books", (err, row) => {
        if (row) stats.totalBooks = row.count;
        db.get("SELECT SUM(total_copies) as sum FROM books", (err, row) => {
            if (row) stats.totalStock = row.sum || 0;
            db.get("SELECT COUNT(*) as count FROM transactions WHERE type = 'ISSUE' AND return_date IS NULL", (err, row) => {
                if (row) stats.activeIssues = row.count;
                db.get("SELECT SUM(fine_amount) as sum FROM transactions", (err, row) => {
                    if (row) stats.totalFines = row.sum || 0;
                    db.get("SELECT COUNT(*) as count FROM users WHERE role != 'Librarian'", (err, row) => {
                        if (row) stats.totalUsers = row.count;
                        res.json(stats);
                    });
                });
            });
        });
    });
});

module.exports = router;
