const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'library.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');

        db.serialize(() => {
            // Users Table
            db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT, -- 'Student', 'Faculty', 'Librarian'
        whatsapp_number TEXT,
        joined_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        grad_or_leave_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

            // Books Table
            db.run(`CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT,
        category TEXT,
        total_copies INTEGER,
        available_copies INTEGER,
        image_url TEXT
      )`);

            // Transactions Table
            db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        book_id INTEGER,
        type TEXT, -- 'ISSUE', 'RETURN'
        issue_date DATETIME,
        due_date DATETIME,
        return_date DATETIME,
        fine_amount REAL DEFAULT 0,
        tx_hash TEXT,
        block_number INTEGER,
        gas_used INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(book_id) REFERENCES books(id)
      )`);

            // Migrations: Add blockchain columns if they don't exist
            db.run("ALTER TABLE transactions ADD COLUMN tx_hash TEXT", (err) => {
                if (err && !err.message.includes("duplicate column name")) {
                    console.log("Migration: tx_hash column already exists or other error:", err.message);
                }
            });
            db.run("ALTER TABLE transactions ADD COLUMN block_number INTEGER", (err) => {
                if (err && !err.message.includes("duplicate column name")) {
                    console.log("Migration: block_number column already exists or other error:", err.message);
                }
            });
            db.run("ALTER TABLE transactions ADD COLUMN gas_used INTEGER", (err) => {
                if (err && !err.message.includes("duplicate column name")) {
                    console.log("Migration: gas_used column already exists or other error:", err.message);
                }
            });

            // Notifications Table
            db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        message TEXT,
        read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

            // Seed Admin Users (Librarians) if not exists
            const seedAdmin = db.prepare("INSERT OR IGNORE INTO users (name, email, password, role, whatsapp_number, joined_date, grad_or_leave_date) VALUES (?, ?, ?, ?, ?, ?, ?)");
            const farFuture = new Date();
            farFuture.setFullYear(farFuture.getFullYear() + 50);

            // Librarian 1
            seedAdmin.run('Librarian 1', 'admin@library.com', 'admin123', 'Librarian', '+910000000000', new Date().toISOString(), farFuture.toISOString());

            // Librarian 2
            seedAdmin.run('Librarian 2', 'librarian2@library.com', 'lib123', 'Librarian', '+910000000001', new Date().toISOString(), farFuture.toISOString(), function (err) {
                if (err) console.error("Error seeding librarians:", err);
                seedAdmin.finalize();
            });

            // Seed Student User
            const seedStudent = db.prepare("INSERT OR IGNORE INTO users (name, email, password, role, whatsapp_number, joined_date, grad_or_leave_date) VALUES (?, ?, ?, ?, ?, ?, ?)");
            // Student graduates in 4 years
            const gradDate = new Date();
            gradDate.setFullYear(gradDate.getFullYear() + 4);
            seedStudent.run('Student User', 'student@library.com', 'password', 'Student', '+910000000000', new Date().toISOString(), gradDate.toISOString(), function (err) {
                if (err) console.error("Error seeding student:", err);
                seedStudent.finalize();
            });

            // Seed Books
            db.get("SELECT count(*) as count FROM books", [], (err, row) => {
                if (err) return console.error(err.message);
                if (row.count < 140) {
                    console.log(`Seeding books... (Current count: ${row.count})`);
                    const stmt = db.prepare("INSERT INTO books (title, author, category, total_copies, available_copies, image_url) VALUES (?, ?, ?, ?, ?, ?)");

                    const domains = ['Fiction', 'Technology', 'Science', 'History', 'Philosophy'];
                    const authors = ['Robert C. Martin', 'J.K. Rowling', 'Stephen Hawking', 'George Orwell', 'Yuval Noah Harari', 'Carl Sagan', 'William Shakespeare', 'Agatha Christie', 'Isaac Asimov', 'Neil deGrasse Tyson'];
                    const titles = [
                        'Clean Code', 'Harry Potter', 'A Brief History of Time', '1984', 'Sapiens', 'Cosmos', 'Hamlet', 'Murder on the Orient Express', 'Foundation', 'Astrophysics for People in a Hurry',
                        'Designing Data-Intensive Applications', 'The Pragmatic Programmer', 'Introduction to Algorithms', 'The Art of Computer Programming', 'Code Complete', 'Refactoring', 'Structure and Interpretation of Computer Programs', 'Cracking the Coding Interview', 'The Selfish Gene', 'The Elegant Universe',
                        'The Great Gatsby', 'To Kill a Mockingbird', 'The Hobbit', 'Fahrenheit 451', 'Brave New World', 'The Alchemist', 'The Catcher in the Rye', 'Animal Farm', 'The Little Prince', 'The Da Vinci Code',
                        'Pride and Prejudice', 'Sense and Sensibility', 'Wuthering Heights', 'Jane Eyre', 'Great Expectations', 'Oliver Twist', 'The Adventures of Huckleberry Finn', 'Moby-Dick', 'War and Peace', 'Crime and Punishment',
                        'The Odyssey', 'The Iliad', 'The Republic', 'The Prince', 'The Wealth of Nations', 'Capital', 'Thus Spoke Zarathustra', 'Beyond Good and Evil', 'The Stranger', 'The Myth of Sisyphus'
                    ];

                    const images = [
                        'https://covers.openlibrary.org/b/id/7222246-L.jpg',
                        'https://covers.openlibrary.org/b/id/8394982-L.jpg',
                        'https://covers.openlibrary.org/b/id/8225261-L.jpg',
                        'https://covers.openlibrary.org/b/id/8254332-L.jpg',
                        'https://covers.openlibrary.org/b/id/10543226-L.jpg'
                    ];

                    // Seed 140 unique-ish books
                    for (let i = 1; i <= 140; i++) {
                        const domain = domains[i % domains.length];
                        const author = authors[i % authors.length];
                        const baseTitle = titles[i % titles.length];
                        const image = images[i % images.length];

                        stmt.run(
                            `${baseTitle} (Vol. ${i})`,
                            author,
                            domain,
                            5,
                            5,
                            image
                        );
                    }
                    stmt.finalize();
                }
            });
        });
    }
});

module.exports = db;
