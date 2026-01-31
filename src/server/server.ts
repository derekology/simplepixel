const express = require("express");
const path = require("path");

const { createPixel, recordPixelEvent, getPixelStats, deletePixel } = require("../services/pixelService");
const { startCleanupService } = require("../services/cleanupService");

import type { Request, Response } from "express";

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST_NAME = process.env.HOST_NAME || "localhost";
const PIXEL_BUFFER = Buffer.from("R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=", "base64");

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use("/frontend", express.static(path.join(__dirname, "../frontend/dist")));

function sendPixelResponse(res: Response) {
    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(PIXEL_BUFFER);
}

function handleNotFound(res: Response, message: string = "Pixel not found") {
    res.status(404).json({ error: message });
}

app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok", timestamp: Date.now() });
});

app.get("/p/:pixelId.gif", (req: Request, res: Response) => {
    const pixelId = req.params.pixelId;
    if (!pixelId || Array.isArray(pixelId)) {
        res.setHeader("Content-Type", "image/gif");
        return res.send(PIXEL_BUFFER);
    }

    recordPixelEvent(pixelId, req.ip, req.get("User-Agent") || "", req.query as any);

    sendPixelResponse(res);
});

app.get("/", (req: Request, res: Response) => {
    const pixelId = createPixel();
    const redirectUrl = PORT === 80 || PORT === 443
        ? `${req.protocol}://${HOST_NAME}/${pixelId}`
        : `${req.protocol}://${HOST_NAME}:${PORT}/${pixelId}`;
    res.redirect(redirectUrl);
});

app.get("/stats/:pixelId", (req: Request, res: Response) => {
    const stats = getPixelStats(req.params.pixelId);
    if (!stats) return handleNotFound(res);
    res.json(stats);
});

app.post("/delete/:pixelId", (req: Request, res: Response) => {
    const deleted = deletePixel(req.params.pixelId);
    if (!deleted) return handleNotFound(res);
    res.json({ success: true });
});

app.get("/:pixelId", async (req: Request, res: Response) => {
    const { pixelId } = req.params;
    const stats = await getPixelStats(pixelId);

    const indexPath = path.join(__dirname, "../frontend/dist/index.html");
    res.render(indexPath, {
        pixelId,
        stats: stats || null
    });
});

startCleanupService();

app.listen(PORT, () => {
    console.log(`Simple Pixel server running on http://${HOST_NAME}:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database: ${process.env.DB_PATH || 'default location'}`);
});
