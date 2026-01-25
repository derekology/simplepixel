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

    const dashboardUrl = `https://${HOST_NAME}/${pixelId}`;

    res.json({ url: dashboardUrl });
});

app.get("/:pixelId", (req: Request, res: Response) => {
    const { pixelId } = req.params;

    if (!pixelId) {
        return res.status(400).json({ error: "Missing pixelId" });
    }

    const pixel = repository.getPixelById(pixelId);
    if (!pixel) {
        return res.status(404).json({ error: "Pixel not found" });
    }

    const events = repository.getEventsByPixelId(pixelId);

    const ipCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};
    const regionCounts: Record<string, number> = {};
    const deviceTypeCounts: Record<string, number> = {};
    const osCounts: Record<string, number> = {};
    const browserCounts: Record<string, number> = {};
    const paramCounts: Record<string, Record<string, number>> = {};

    const publicEvents: any[] = [];

    for (const event of events) {
        ipCounts[event.ip_hash] = (ipCounts[event.ip_hash] || 0) + 1;
        const isReturning = (ipCounts[event.ip_hash] ?? 0) > 1;

        if (event.country) {
            countryCounts[event.country] = (countryCounts[event.country] || 0) + 1;
        }

        if (event.region) {
            regionCounts[event.region] = (regionCounts[event.region] || 0) + 1;
        }

        if (event.device_type) {
            deviceTypeCounts[event.device_type] =
                (deviceTypeCounts[event.device_type] || 0) + 1;
        }

        if (event.os) {
            osCounts[event.os] = (osCounts[event.os] || 0) + 1;
        }

        if (event.browser) {
            browserCounts[event.browser] =
                (browserCounts[event.browser] || 0) + 1;
        }

        const params = event.params ?? {};
        for (const key of Object.keys(params)) {
            paramCounts[key] = paramCounts[key] || {};
            const value = params[key];
            paramCounts[key][value] = (paramCounts[key][value] || 0) + 1;
        }

        publicEvents.push({
            timestamp: event.timestamp,
            isReturning,
            country: event.country,
            region: event.region,
            browser: event.browser,
            os: event.os,
            deviceType: event.device_type,
            params,
            notes: event.notes ?? null
        });
    }

    const uniqueUsers = Object.keys(ipCounts).length;
    const returningUsers = Object.values(ipCounts).filter(c => c > 1).length;
    const newUsers = uniqueUsers - returningUsers;

    res.json({
        events: publicEvents,
        summary: {
            totalEvents: events.length,
            uniqueUsers,
            newUsers,
            returningUsers,
            countryCounts,
            regionCounts,
            deviceTypeCounts,
            osCounts,
            browserCounts,
            paramCounts
        }
    });
});

app.listen(PORT, () => {
    console.log(`Simple Pixel server running on http://${HOST_NAME}:${PORT}`);
});
