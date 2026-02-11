export class PixelNotFoundError extends Error {
    constructor(pixelId: string) {
        super(`Pixel not found: ${pixelId}`);
        this.name = "PixelNotFoundError";
    }
}

export class PixelExpiredError extends Error {
    constructor(pixelId: string) {
        super(`Pixel expired: ${pixelId}`);
        this.name = "PixelExpiredError";
    }
}
