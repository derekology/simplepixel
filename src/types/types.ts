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
    notes?: string | null;
}

export interface IPixel {
    id: string;
    created_at: number;
    expires_at: number;
}

export interface IUserAgentInfo {
    browser: string;
    os: string;
    deviceType: "Mobile" | "Tablet" | "Desktop";
}
export interface IIpInfo {
    ipHash: string;
    country: string;
    region: string;
}

export interface IPixelRepository {
    getPixelById(id: string): IPixel | undefined;
    createPixel(id: string, createdAt: number, expiresAt: number): void;
    createEvent(event: Omit<IPixelEvent, 'id' | 'params'> & { params: string }): void;
    getEventsByPixelId(pixelId: string): IPixelEvent[];
    getDistinctIpHashesByPixelId(pixelId: string): string[];
}

export interface IPixelEventPublic {
    timestamp: number;
    isReturning: boolean;
    country: string | null;
    region: string | null;
    browser: string | null;
    os: string | null;
    deviceType: "Mobile" | "Tablet" | "Desktop" | null;
    params: Record<string, string>;
    notes: string | null;
}

export interface IPixelMetadata {
    id: string;
    createdAt: number;
    expiresAt: number;
}

export interface IPixelStatsSummary {
    totalEvents: number;
    uniqueUsers: number;
    newUsers: number;
    returningUsers: number;
    eventsPerUser: number;

    countryCounts: Record<string, number>;
    deviceTypeCounts: Record<string, number>;
    osCounts: Record<string, number>;
    browserCounts: Record<string, number>;

    paramCounts: Record<string, Record<string, number>>;
    parameterRows: Array<{ parameter: string; value: string; count: number }>;
}