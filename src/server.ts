const express = require("express");
const repository = require("./repos/sqlite3");
const setupDatabase = require("./lib/dbSetup");
const { v4: uuidv4 } = require("uuid");

const { processIp } = require("./lib/ip");
const { processUserAgent } = require("./lib/userAgent");

import type { Pixel } from "./types/pixel.js";
import type { PixelEvent } from "./types/event.js";
import type { Request, Response } from "express";

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

    const pixel = repository.getPixelById(pixelId) as Pixel;

    if (pixel && timestamp < pixel.expires_at) {
        const ip = req.ip;
        const userAgent = req.get("User-Agent") || "";

        const { ipHash, country, region } = processIp(ip);
        const { browser, os, deviceType } = processUserAgent(userAgent);

        const paramsJSON = JSON.stringify(req.query);

        repository.createEvent({
            pixelId,
            timestamp,
            ipHash,
            country,
            region,
            browser,
            os,
            deviceType,
            params: paramsJSON
        });
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
