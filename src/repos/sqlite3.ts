const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const { DB_SCHEMA } = require("../lib/schema");

import type { IPixel, IPixelEvent, IPixelRepository } from "../types/types";

const dbPath = process.env.DB_PATH || path.join(__dirname, "../data/simple-pixel.db");

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

function tableExists(tableName: string): boolean {
    return !!db
        .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`)
        .get(tableName);
}

function getExistingColumns(tableName: string): string[] {
    return db
        .prepare(`PRAGMA table_info(${tableName})`)
        .all()
        .map((col: { name: string }) => col.name);
}

function createTable(tableName: string, columns: Record<string, string>) {
    const columnDefs = Object.entries(columns)
        .map(([colName, colType]) => `${colName} ${colType}`)
        .join(', ');

    const createTableSQL = `CREATE TABLE ${tableName} (${columnDefs})`;
    db.exec(createTableSQL);
    console.log(`Created table: ${tableName}`);
}

function addMissingColumns(tableName: string, schemaColumns: Record<string, string>, existingColumns: string[]) {
    for (const colName of Object.keys(schemaColumns)) {
        if (!existingColumns.includes(colName)) {
            const colType = schemaColumns[colName];
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

function setupDatabase() {
    console.log("Checking database schema...");

    for (const [tableName, tableSchema] of Object.entries(DB_SCHEMA.tables) as [string, { columns: Record<string, string> }][]) {
        if (!tableExists(tableName)) {
            createTable(tableName, tableSchema.columns);
        } else {
            const existingColumns = getExistingColumns(tableName);
            addMissingColumns(tableName, tableSchema.columns, existingColumns);
        }
    }

    console.log("Database schema is up to date.");
}

function parseEventParams(paramsString: string | Record<string, any>): Record<string, string> | undefined {
    return typeof paramsString === 'string'
        ? JSON.parse(paramsString)
        : paramsString;
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
            .prepare("SELECT * FROM events WHERE pixel_id = ? ORDER BY timestamp ASC")
            .all(pixelId);

        return rows.map((row: any) => ({
            id: row.id,
            pixel_id: row.pixel_id,
            timestamp: row.timestamp,
            ip_hash: row.ip_hash,
            country: row.country,
            region: row.region,
            browser: row.browser,
            os: row.os,
            device_type: row.device_type,
            params: parseEventParams(row.params),
            notes: row.notes
        }));
    }

    getDistinctIpHashesByPixelId(pixelId: string): string[] {
        const rows = db
            .prepare("SELECT DISTINCT ip_hash FROM events WHERE pixel_id = ?")
            .all(pixelId);

        return rows.map((row: any) => row.ip_hash);
    }

    deletePixel(id: string): void {
        db.prepare("DELETE FROM events WHERE pixel_id = ?").run(id);
        db.prepare("DELETE FROM pixels WHERE id = ?").run(id);
    }

    getAllPixels(): IPixel[] {
        const rows = db.prepare("SELECT * FROM pixels").all();
        return rows;
    }

    get db() {
        return db;
    }
}

setupDatabase();

module.exports = new SqliteRepository();
