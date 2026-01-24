const db = require("../lib/db");

import type { Pixel } from "../types/pixel.js";
import type { PixelEvent } from "../types/event.js";

export interface PixelRepository {
    getPixelById(id: string): Pixel | undefined;
    createPixel(id: string, createdAt: number, expiresAt: number): void;
    createEvent(event: {
        pixelId: string;
        timestamp: number;
        ipHash: string;
        country: string;
        region: string;
        browser: string;
        os: string;
        deviceType: string;
        params: string;
    }): void;
}

class SqliteRepository implements PixelRepository {
    getPixelById(id: string): Pixel | undefined {
        return db
            .prepare("SELECT * FROM pixels WHERE id = ?")
            .get(id) as Pixel | undefined;
    }

    createPixel(id: string, createdAt: number, expiresAt: number): void {
        db.prepare(
            "INSERT INTO pixels (id, created_at, expires_at) VALUES (?, ?, ?)"
        ).run(id, createdAt, expiresAt);
    }

    createEvent(event: {
        pixelId: string;
        timestamp: number;
        ipHash: string;
        country: string;
        region: string;
        browser: string;
        os: string;
        deviceType: string;
        params: string;
    }): void {
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
            event.pixelId,
            event.timestamp,
            event.ipHash,
            event.country,
            event.region,
            event.browser,
            event.os,
            event.deviceType,
            event.params
        );
    }
}

module.exports = new SqliteRepository();
