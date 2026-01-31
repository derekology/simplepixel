const repository = require("../repos/sqlite3");

const MINUTES_TO_MS = 60 * 1000;
const DEFAULT_CLEANUP_INTERVAL = 60;

function logCleanupResult(deletedCount: number) {
    if (deletedCount > 0) {
        console.log(`Cleanup complete: ${deletedCount} expired pixel(s) deleted`);
    }
}

function deleteExpiredPixels() {
    const now = Date.now();
    const pixels = repository.getAllPixels();

    let deletedCount = 0;

    for (const pixel of pixels) {
        if (pixel.expires_at <= now) {
            repository.deletePixel(pixel.id);
            deletedCount++;
            console.log(`Deleted expired pixel: ${pixel.id}`);
        }
    }

    logCleanupResult(deletedCount);

    return deletedCount;
}

function startCleanupService(intervalMinutes?: number) {
    const interval = intervalMinutes || 
        parseInt(process.env.CLEANUP_INTERVAL_MINUTES || String(DEFAULT_CLEANUP_INTERVAL), 10);
    
    console.log(`Starting pixel cleanup service (runs every ${interval} minutes)`);

    deleteExpiredPixels();

    setInterval(() => {
        console.log('Running scheduled pixel cleanup...');
        deleteExpiredPixels();
    }, interval * MINUTES_TO_MS);
}

module.exports = {
    deleteExpiredPixels,
    startCleanupService
};
