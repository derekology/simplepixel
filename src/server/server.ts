import express from "express";
import path from "path";
import ejs from "ejs";
import { fileURLToPath } from "url";
import repository from "../repos/sqlite3.js";
import { PixelService } from "../services/pixelService.js";
import { CleanupService } from "../services/cleanupService.js";
import type { Request, Response } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const PIXEL_BUFFER = Buffer.from("R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=", "base64");

const FRONTEND_DIST = path.join(__dirname, "../frontend/dist");
const INDEX_HTML = path.join(FRONTEND_DIST, "index.html");

const pixelService = new PixelService(repository);
const cleanupService = new CleanupService(repository);

app.set('trust proxy', true);

app.engine('html', ejs.renderFile);
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

app.get("/favicon.ico", (req: Request, res: Response) => {
    const faviconPath = path.join(FRONTEND_DIST, "favicon.ico");
    res.sendFile(faviconPath, (err) => {
        if (err) {
            console.error('Favicon error:', err);
            res.status(404).send('Favicon not found');
        }
    });
});

app.get("/p/:pixelId.gif", (req: Request, res: Response) => {
    const pixelId = req.params.pixelId;
    if (!pixelId || Array.isArray(pixelId)) {
        res.setHeader("Content-Type", "image/gif");
        return res.send(PIXEL_BUFFER);
    }

    pixelService.recordPixelEvent(pixelId, req.ip || "", req.get("User-Agent") || "", req.query as any);

    sendPixelResponse(res);
});

app.get("/", (req: Request, res: Response) => {
    const pixelId = pixelService.createPixel();
    const protocol = req.protocol;
    const host = req.get('host');
    res.redirect(`${protocol}://${host}/${pixelId}`);
});

app.get("/stats/:pixelId", (req: Request, res: Response) => {
    const pixelId = req.params.pixelId;
    if (!pixelId || Array.isArray(pixelId)) return handleNotFound(res);
    const stats = pixelService.getPixelStats(pixelId);
    if (!stats) return handleNotFound(res);
    res.json(stats);
});

app.post("/delete/:pixelId", (req: Request, res: Response) => {
    const pixelId = req.params.pixelId;
    if (!pixelId || Array.isArray(pixelId)) return handleNotFound(res);
    const deleted = pixelService.deletePixel(pixelId);
    if (!deleted) return handleNotFound(res);
    res.json({ success: true });
});

app.get("/:pixelId", async (req: Request, res: Response) => {
    const pixelId = req.params.pixelId;
    if (!pixelId || Array.isArray(pixelId)) {
        return res.status(400).send("Invalid pixel ID");
    }
    const stats = await pixelService.getPixelStats(pixelId);

    res.render(INDEX_HTML, {
        pixelId,
        stats: stats || null,
        nodeEnv: process.env.NODE_ENV || 'development'
    });
});

cleanupService.start();

app.listen(PORT, () => {
    console.log(`Simple Pixel server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database: ${process.env.DB_PATH || 'default location'}`);
    console.log(`Hot reload enabled via tsx watch`);
});
