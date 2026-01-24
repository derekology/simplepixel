export interface PixelEvent {
    id?: number;
    pixel_id: string;
    timestamp: number;
    ip_hash: string;
    country?: string | null;
    region?: string | null;
    browser?: string | null;
    os?: string | null;
    device_type?: "mobile" | "tablet" | "desktop" | null;
    params?: Record<string, string>;
}