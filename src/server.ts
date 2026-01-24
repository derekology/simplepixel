const express = require("express");
const repository = require("./repos/sqlite3");
const { v4: uuidv4 } = require("uuid");

const { processIp } = require("./lib/ip");
const { processUserAgent } = require("./lib/userAgent");
const { MAX_PARAMS } = require("./lib/schema");

import type { Request, Response } from "express";
import type { IPixel, IPixelEvent, IIpInfo, IUserAgentInfo } from "./types/types";

const app = express();
const PORT = process.env.PORT || 3000;
const HOST_NAME = process.env.HOST_NAME || "localhost";

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

        const queryParams = req.query;
        const paramKeys = Object.keys(queryParams);
        const paramCount = paramKeys.length;

        let notesArray: string[] = [];
        let limitedParams = queryParams;

        if (paramCount > MAX_PARAMS) {
            const limitedKeys = paramKeys.slice(0, MAX_PARAMS);
            limitedParams = limitedKeys.reduce((acc, key) => {
                acc[key] = queryParams[key];
                return acc;
            }, {} as Record<string, any>);
            notesArray.push(`Only first ${MAX_PARAMS} of ${paramCount} params saved`);
        }

        const paramsJSON = JSON.stringify(limitedParams);

        const event: Omit<IPixelEvent, 'id' | 'params'> & { params: string } = {
            pixel_id: pixelId,
            timestamp,
            ip_hash: ipHash,
            country,
            region,
            browser,
            os,
            device_type: deviceType,
            params: paramsJSON,
            notes: notesArray.length > 0 ? notesArray.join("; ") : null
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

    const pixelUrl = `https://${HOST_NAME}/p/${pixelId}.gif`;
    res.json({ pixelId, url: pixelUrl });
});

app.listen(PORT, () => {
    console.log(`Simple Pixel server running on http://${HOST_NAME}:${PORT}`);
});
