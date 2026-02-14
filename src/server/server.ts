import express from "express";
import path from "path";
import ejs from "ejs";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { validate as isValidUUID } from "uuid";
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

app.set('trust proxy', 1);

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://derekw.co"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

const pixelCreationLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { error: "Too many pixel creation requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
});

const pixelTrackingLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1000,
    keyGenerator: (req, _res) => {
        const pixelId = req.params.pixelId;
        if (typeof pixelId === 'string') {
            return pixelId;
        }
        const forwarded = req.headers['x-forwarded-for'];
        const ip = typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : req.socket?.remoteAddress;
        return ip || "unknown";
    },
    message: { error: "Rate limit exceeded" },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { error: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
});

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

app.use("/frontend", express.static(FRONTEND_DIST));

function isValidPixelId(pixelId: string | string[] | undefined): pixelId is string {
    if (!pixelId || Array.isArray(pixelId)) return false;
    return isValidUUID(pixelId);
}

function sendPixelResponse(res: Response) {
    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(PIXEL_BUFFER);
}

function handleNotFound(res: Response, message: string = "Pixel not found") {
    res.status(404).json({ error: message });
}

function handleInvalidPixelId(res: Response) {
    res.status(400).json({ error: "Invalid pixel ID format" });
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

app.get("/p/:pixelId.gif", pixelTrackingLimiter, (req: Request, res: Response) => {
    const pixelId = req.params.pixelId;
    if (!isValidPixelId(pixelId)) {
        res.setHeader("Content-Type", "image/gif");
        return res.send(PIXEL_BUFFER);
    }

    pixelService.recordPixelEvent(pixelId, req.ip || "", req.get("User-Agent") || "", req.query as any);

    sendPixelResponse(res);
});

app.get("/", pixelCreationLimiter, (req: Request, res: Response) => {
    const pixelId = pixelService.createPixel();
    const protocol = req.protocol;
    const host = req.get('host');
    res.redirect(`${protocol}://${host}/${pixelId}`);
});

app.get("/stats/:pixelId", apiLimiter, (req: Request, res: Response) => {
    const pixelId = req.params.pixelId;
    if (!isValidPixelId(pixelId)) return handleInvalidPixelId(res);
    const stats = pixelService.getPixelStats(pixelId);
    if (!stats) return handleNotFound(res);
    res.json(stats);
});

app.post("/delete/:pixelId", apiLimiter, (req: Request, res: Response) => {
    const pixelId = req.params.pixelId;
    if (!isValidPixelId(pixelId)) return handleInvalidPixelId(res);
    const deleted = pixelService.deletePixel(pixelId);
    if (!deleted) return handleNotFound(res);
    res.json({ success: true });
});

app.get("/:pixelId", async (req: Request, res: Response) => {
    const pixelId = req.params.pixelId;
    if (!isValidPixelId(pixelId)) {
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Simple Pixel server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database: ${process.env.DB_PATH || 'default location'}`);
    console.log(`Hot reload enabled via tsx watch`);
});
