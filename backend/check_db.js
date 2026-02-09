const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./library.db');

db.all("SELECT count(*) as count FROM books", [], (err, rows) => {
    if (err) console.error(err);
    console.log("Book Count:", rows[0].count);
    db.all("SELECT count(*) as count FROM users", [], (err, rows) => {
        if (err) console.error(err);
        console.log("User Count:", rows[0].count);
        db.close();
    });
});
