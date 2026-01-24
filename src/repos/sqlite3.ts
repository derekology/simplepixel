const db = require("../lib/db");

import type { IPixel, IPixelEvent } from "../types/types";

export interface PixelRepository {
    getPixelById(id: string): IPixel | undefined;
    createPixel(id: string, createdAt: number, expiresAt: number): void;
    createEvent(event: Omit<IPixelEvent, 'id' | 'params'> & { params: string }): void;
}

class SqliteRepository implements PixelRepository {
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
                params
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            event.pixel_id,
            event.timestamp,
            event.ip_hash,
            event.country,
            event.region,
            event.browser,
            event.os,
            event.device_type,
            event.params
        );
    }
}

module.exports = new SqliteRepository();
