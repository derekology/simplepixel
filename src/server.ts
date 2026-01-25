const express = require("express");

const { createPixel, recordPixelEvent, getPixelStats } = require("./services/pixelService");

import type { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 3000;
const HOST_NAME = process.env.HOST_NAME || `localhost:${PORT}`;

const PIXEL_BUFFER = Buffer.from("R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=", "base64");

app.get("/p/:id.gif", (req: Request, res: Response) => {
    const pixelId = req.params.id;
    if (!pixelId || Array.isArray(pixelId)) {
        res.setHeader("Content-Type", "image/gif");
        return res.send(PIXEL_BUFFER);
    }

    recordPixelEvent(pixelId, req.ip, req.get("User-Agent") || "", req.query as any);

    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(PIXEL_BUFFER);
});

app.get("/create-pixel", (req: Request, res: Response) => {
    const pixelId = createPixel();
    res.redirect(`https://${HOST_NAME}/${pixelId}`);
});

app.get("/stats/:pixelId", (req: Request, res: Response) => {
    const stats = getPixelStats(req.params.pixelId);
    if (!stats) return res.status(404).json({ error: "Pixel not found" });
    res.json(stats);
});

app.listen(PORT, () => console.log(`Simple Pixel server running on http://${HOST_NAME}`));
