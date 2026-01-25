const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const { DB_SCHEMA } = require("../lib/schema");

import type { IPixel, IPixelEvent, IPixelRepository } from "../types/types";

const dbPath = path.join(__dirname, "../data/simple-pixel.db");
const db = new Database(dbPath);

function setupDatabase() {
    console.log("Checking database schema...");

    for (const [tableName, tableSchema] of Object.entries(DB_SCHEMA.tables) as [string, { columns: Record<string, string> }][]) {
        const tableExists = db
            .prepare(
                `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
            )
            .get(tableName);

        if (!tableExists) {
            const columns = Object.entries(tableSchema.columns)
                .map(([colName, colType]) => `${colName} ${colType}`)
                .join(', ');

            const createTableSQL = `CREATE TABLE ${tableName} (${columns})`;
            db.exec(createTableSQL);
            console.log(`Created table: ${tableName}`);
        } else {
            const existingColumns = db
                .prepare(`PRAGMA table_info(${tableName})`)
                .all()
                .map((col: { name: string }) => col.name);

            const schemaColumns = Object.keys(tableSchema.columns);

            for (const colName of schemaColumns) {
                if (!existingColumns.includes(colName)) {
                    const colType = tableSchema.columns[colName];
                    if (typeof colType === "string" && colType) {
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

class SqliteRepository implements IPixelRepository {
    getPixelById(id: string): IPixel | undefined {
        return db
            .prepare("SELECT * FROM pixels WHERE id = ?")
            .get(id) as IPixel | undefined;
    }

    createPixel(id: string, createdAt: number, expiresAt: number): void {
        db.prepare(
            "INSERT INTO pixels (id, created_at, expires_at) VALUES (?, ?, ?)"
        ).run(id, createdAt, expiresAt);
    }

    createEvent(event: Omit<IPixelEvent, 'id' | 'params'> & { params: string }): void {
        db.prepare(`
            INSERT INTO events (
                pixel_id,
                timestamp,
                ip_hash,
                country,
                region,
                browser,
                os,
                device_type,
                params,
                notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            event.pixel_id,
            event.timestamp,
            event.ip_hash,
            event.country,
            event.region,
            event.browser,
            event.os,
            event.device_type,
            event.params,
            event.notes ?? null
        );
    }

    getEventsByPixelId(pixelId: string): IPixelEvent[] {
        const rows = db
            .prepare("SELECT * FROM events WHERE pixel_id = ? ORDER BY timestamp DESC")
            .all(pixelId);

        return rows.map((row: any) => {
            let params: Record<string, string> | undefined;

            params = typeof row.params === 'string'
                ? JSON.parse(row.params)
                : row.params;

            return {
                id: row.id,
                pixel_id: row.pixel_id,
                timestamp: row.timestamp,
                ip_hash: row.ip_hash,
                country: row.country,
                region: row.region,
                browser: row.browser,
                os: row.os,
                device_type: row.device_type,
                params,
                notes: row.notes
            };
        });
    }

    getDistinctIpHashesByPixelId(pixelId: string): string[] {
        const rows = db
            .prepare("SELECT DISTINCT ip_hash FROM events WHERE pixel_id = ?")
            .all(pixelId);

        return rows.map((row: any) => row.ip_hash);
    }
}

setupDatabase();

module.exports = new SqliteRepository();
