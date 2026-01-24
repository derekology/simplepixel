const express = require("express");
const repository = require("./repos/sqlite3");
const setupDatabase = require("./lib/dbSetup");
const { v4: uuidv4 } = require("uuid");

const { processIp } = require("./lib/ip");
const { processUserAgent } = require("./lib/userAgent");

import type { Request, Response } from "express";
import type { IPixel, IPixelEvent, IIpInfo, IUserAgentInfo } from "./types/types";

setupDatabase();

const app = express();
const PORT = process.env.PORT || 3000;

const PIXEL_BUFFER = Buffer.from(
    "R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=",
    "base64"
);

app.get("/p/:id.gif", (req: Request, res: Response) => {
    const pixelId = req.params.id;
    const timestamp = Date.now();

    if (!pixelId || Array.isArray(pixelId)) {
        res.setHeader("Content-Type", "image/gif");
        res.send(PIXEL_BUFFER);
        return;
    }

    const pixel = repository.getPixelById(pixelId) as IPixel;

    if (pixel && timestamp < pixel.expires_at) {
        const ip = req.ip;
        const userAgent = req.get("User-Agent") || "";

        const { ipHash, country, region } = processIp(ip) as IIpInfo;
        const { browser, os, deviceType } = processUserAgent(userAgent) as IUserAgentInfo;

        const paramsJSON = JSON.stringify(req.query);

        const event: Omit<IPixelEvent, 'id' | 'params'> & { params: string } = {
            pixel_id: pixelId,
            timestamp,
            ip_hash: ipHash,
            country,
            region,
            browser,
            os,
            device_type: deviceType,
            params: paramsJSON
        };

        repository.createEvent(event);
    }

    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(PIXEL_BUFFER);
});

app.post("/create-pixel", (req: Request, res: Response) => {
    const pixelId = uuidv4();
    const now = Date.now();
    const expires = now + 7 * 24 * 60 * 60 * 1000;

    repository.createPixel(pixelId, now, expires);

    const pixelUrl = `https://yourdomain.com/p/${pixelId}.gif`;
    res.json({ pixelId, url: pixelUrl });
});

app.listen(PORT, () => {
    console.log(`Simple Pixel server running on http://localhost:${PORT}`);
});
