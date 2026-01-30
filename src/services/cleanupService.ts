const repository = require("../repos/sqlite3");

const MINUTES_TO_MS = 60 * 1000;

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

function startCleanupService(intervalMinutes: number = 60) {
    console.log(`Starting pixel cleanup service (runs every ${intervalMinutes} minutes)`);

    deleteExpiredPixels();

    setInterval(() => {
        console.log('Running scheduled pixel cleanup...');
        deleteExpiredPixels();
    }, intervalMinutes * MINUTES_TO_MS);
}

module.exports = {
    deleteExpiredPixels,
    startCleanupService
};
