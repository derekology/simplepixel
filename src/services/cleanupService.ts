import type { IPixelRepository } from "../types/types.js";

const MINUTES_TO_MS = 60 * 1000;
const DEFAULT_CLEANUP_INTERVAL = 60;

export class CleanupService {
    private intervalId: NodeJS.Timeout | undefined;

    constructor(private readonly repository: IPixelRepository) {}

    deleteExpiredPixels(): number {
        const now = Date.now();
        const pixels = this.repository.getAllPixels();

        let deletedCount = 0;

        for (const pixel of pixels) {
            if (pixel.expires_at <= now) {
                this.repository.deletePixel(pixel.id);
                deletedCount++;
                console.log(`Deleted expired pixel: ${pixel.id}`);
            }
        }

        this.logCleanupResult(deletedCount);

        return deletedCount;
    }

    start(intervalMinutes?: number): void {
        const interval = intervalMinutes || 
            parseInt(process.env.CLEANUP_INTERVAL_MINUTES || String(DEFAULT_CLEANUP_INTERVAL), 10);
        
        console.log(`Starting pixel cleanup service (runs every ${interval} minutes)`);

        this.deleteExpiredPixels();

        this.intervalId = setInterval(() => {
            console.log('Running scheduled pixel cleanup...');
            this.deleteExpiredPixels();
        }, interval * MINUTES_TO_MS);
    }

    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
            console.log('Stopped cleanup service');
        }
    }

    private logCleanupResult(deletedCount: number): void {
        if (deletedCount > 0) {
            console.log(`Cleanup complete: ${deletedCount} expired pixel(s) deleted`);
        }
    }
}
