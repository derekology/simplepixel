export interface IPixelEvent {
    id?: number;
    pixel_id: string;
    timestamp: number;
    ip_hash: string;
    country?: string | null;
    region?: string | null;
    browser?: string | null;
    os?: string | null;
    device_type?: "Mobile" | "Tablet" | "Desktop" | null;
    params?: Record<string, string>;
}

export interface IPixel {
    id: string;
    created_at: number;
    expires_at: number;
}

export interface IUserAgentInfo {
    browser: string | null;
    os: string | null;
    deviceType: "Mobile" | "Tablet" | "Desktop";
}
export interface IIpInfo {
    ipHash: string;
    country: string | null;
    region: string | null;
}