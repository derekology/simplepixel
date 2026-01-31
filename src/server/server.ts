const express = require("express");
const path = require("path");

const { createPixel, recordPixelEvent, getPixelStats, deletePixel } = require("../services/pixelService");
const { startCleanupService } = require("../services/cleanupService");

import type { Request, Response } from "express";

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const PIXEL_BUFFER = Buffer.from("R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=", "base64");

const FRONTEND_DIST = path.join(__dirname, "../frontend/dist");
const INDEX_HTML = path.join(FRONTEND_DIST, "index.html");

app.set('trust proxy', true);

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use("/frontend", express.static(FRONTEND_DIST));

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
    const protocol = req.protocol;
    const host = req.get('host');
    res.redirect(`${protocol}://${host}/${pixelId}`);
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

    res.render(INDEX_HTML, {
        pixelId,
        stats: stats || null
    });
});

startCleanupService();

app.listen(PORT, () => {
    console.log(`Simple Pixel server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database: ${process.env.DB_PATH || 'default location'}`);
});
