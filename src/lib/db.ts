const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const { DB_SCHEMA } = require("./schema");

const dbPath = path.join(__dirname, "../../simple-pixel.db");
const db = new Database(dbPath);

function setupDatabase() {
    console.log("Checking database schema...");

    // Check and create tables with their columns
    for (const [tableName, tableSchema] of Object.entries(DB_SCHEMA.tables) as [string, { columns: Record<string, string> }][]) {
        // Check if table exists
        const tableExists = db
            .prepare(
                `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
            )
            .get(tableName);

        if (!tableExists) {
            // Create table with all columns
            const columns = Object.entries(tableSchema.columns)
                .map(([colName, colType]) => `${colName} ${colType}`)
                .join(', ');

            const createTableSQL = `CREATE TABLE ${tableName} (${columns})`;
            db.exec(createTableSQL);
            console.log(`Created table: ${tableName}`);
        } else {
            // Table exists, check for missing columns
            const existingColumns = db
                .prepare(`PRAGMA table_info(${tableName})`)
                .all()
                .map((col: { name: string }) => col.name);

            const schemaColumns = Object.keys(tableSchema.columns);

            for (const colName of schemaColumns) {
                if (!existingColumns.includes(colName)) {
                    const colType = tableSchema.columns[colName];
                    if (typeof colType === "string" && colType) {
                        // Skip PRIMARY KEY and AUTOINCREMENT for ALTER TABLE
                        const cleanColType = colType
                            .replace(/PRIMARY KEY/i, '')
                            .replace(/AUTOINCREMENT/i, '')
                            .trim();

                        if (cleanColType) {
                            db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${colName} ${cleanColType}`);
                            console.log(`Added column ${colName} to table ${tableName}`);
                        }
                    }
                }
            }
        }
    }

    console.log("Database schema is up to date.");
}

setupDatabase();

module.exports = db;

