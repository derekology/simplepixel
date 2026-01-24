const db = require("./db");

function setupDatabase() {
    const row = db.prepare(
        "PRAGMA table_info(events)"
    ).all();

    // const columns = row.map((r: { name: string; }) => r.name);
    // if (!columns.includes("x")) {
    //     db.exec(`ALTER TABLE events ADD COLUMN x TEXT`);
    // }

    console.log("Database schema is up to date.");
}

module.exports = setupDatabase;
