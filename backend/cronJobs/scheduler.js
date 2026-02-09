const cron = require('node-cron');
const db = require('../database');
const { sendWhatsAppMessage } = require('../utils/whatsapp');

const startScheduler = () => {
    console.log('Starting Library Cron Scheduler...');

    // Run every minute for DEMO purposes
    cron.schedule('* * * * *', () => {
        console.log('[Cron] Checking for due/overdue reminders...');

        const query = `
            SELECT t.*, u.whatsapp_number, u.role, u.name, b.title 
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            JOIN books b ON t.book_id = b.id
            WHERE t.type = 'ISSUE' AND t.return_date IS NULL
        `;

        db.all(query, [], (err, rows) => {
            if (err) return console.error(err);

            const now = new Date();

            rows.forEach(row => {
                const issueDate = new Date(row.issue_date);
                const dueDate = new Date(row.due_date);
                const diffTime = now - issueDate;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                let sendReminder = false;
                let message = "";

                // Specific User Request Logic
                if (row.role === 'Student' && diffDays === 13) {
                    sendReminder = true;
                    message = `📢 Final Day Reminder!\n\nHello ${row.name}, your issued book "${row.title}" is due tomorrow (Day 14).\n\nPlease return it to avoid the ₹2/day fine.`;
                } else if (row.role === 'Faculty' && diffDays === 30) {
                    sendReminder = true;
                    message = `📢 Role Reminder!\n\nHello Faculty ${row.name}, your issued book "${row.title}" is due today (Day 30).\n\nPlease return it to avoid the ₹5/day fine.`;
                } else if (now > dueDate) {
                    // Constant overdue alert for demo
                    sendReminder = true;
                    const overdueTime = now - dueDate;
                    const overdueDays = Math.ceil(overdueTime / (1000 * 60 * 60 * 24));
                    message = `⚠️ Overdue Alert!\n\nBook: "${row.title}"\nOverdue by: ${overdueDays} days.\nCurrent Fine: ₹${overdueDays * (row.role === 'Faculty' ? 5 : 2)}`;
                }

                if (sendReminder) {
                    sendWhatsAppMessage(row.whatsapp_number, message, row.user_id);
                }
            });
        });
    });
};

module.exports = { startScheduler };
