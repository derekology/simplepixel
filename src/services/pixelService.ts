import { v4 as uuidv4 } from "uuid";
import { processIp } from "../lib/ip.js";
import { processUserAgent } from "../lib/userAgent.js";
import { MAX_PARAMS } from "../lib/schema.js";
import { PixelNotFoundError, PixelExpiredError } from "../types/errors.js";
import type { 
    IPixelEvent, 
    IIpInfo, 
    IUserAgentInfo, 
    IPixelRepository,
    IPixelMetadata,
    IPixelEventPublic,
    IPixelStatsSummary 
} from "../types/types.js";

const PIXEL_EXPIRY_DAYS = parseInt(process.env.PIXEL_EXPIRY_DAYS || "7", 10);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export class PixelService {
    constructor(private readonly repository: IPixelRepository) {}

    createPixel(): string {
        const pixelId = uuidv4();
        const now = Date.now();
        const expires = now + PIXEL_EXPIRY_DAYS * MS_PER_DAY;
        this.repository.createPixel(pixelId, now, expires);
        return pixelId;
    }

    recordPixelEvent(pixelId: string, ip: string, userAgent: string, queryParams: Record<string, any>): void {
        const timestamp = Date.now();
        const pixel = this.repository.getPixelById(pixelId);

        if (!pixel) return;
        if (timestamp >= pixel.expires_at) return;

        const ipInfo = processIp(ip);
        const uaInfo = processUserAgent(userAgent);
        const { params: limitedParams, notes: notesArray } = this.limitParams(queryParams);

        const event = this.buildEventData(pixelId, timestamp, ipInfo, uaInfo, limitedParams, notesArray);

        this.repository.createEvent(event);
    }

    getPixelStats(pixelId: string): {
        pixel: IPixelMetadata;
        events: IPixelEventPublic[];
        summary: IPixelStatsSummary;
    } | null {
        const pixel = this.repository.getPixelById(pixelId);
        if (!pixel) return null;

        const events = this.repository.getEventsByPixelId(pixelId);

        const ipCounts: Record<string, number> = {};
        const countryCounts: Record<string, number> = {};
        const deviceTypeCounts: Record<string, number> = {};
        const osCounts: Record<string, number> = {};
        const browserCounts: Record<string, number> = {};
        const paramCounts: Record<string, Record<string, number>> = {};
        const publicEvents: IPixelEventPublic[] = [];

        for (const event of events) {
            const isReturning = this.processEventCounts(event, ipCounts);

            this.aggregateDistributions(event, countryCounts, deviceTypeCounts, osCounts, browserCounts);

            const params = event.params && typeof event.params === 'object' ? event.params : {};
            this.aggregateParams(params, paramCounts);

            publicEvents.push(this.buildPublicEvent(event, isReturning));
        }

        const { uniqueUsers, returningUsers, newUsers, eventsPerUser } = this.calculateUserStats(ipCounts, events.length);
        const parameterRows = this.buildParameterRows(paramCounts);

        return {
            pixel: {
                id: pixel.id,
                createdAt: pixel.created_at,
                expiresAt: pixel.expires_at
            },
            events: publicEvents,
            summary: {
                totalEvents: events.length,
                uniqueUsers,
                newUsers,
                returningUsers,
                eventsPerUser,
                countryCounts,
                deviceTypeCounts,
                osCounts,
                browserCounts,
                paramCounts,
                parameterRows
            }
        };
    }

    deletePixel(pixelId: string): boolean {
        const pixel = this.repository.getPixelById(pixelId);
        if (!pixel) return false;
        
        this.repository.deletePixel(pixelId);
        return true;
    }

    private limitParams(queryParams: Record<string, any>): { params: Record<string, any>; notes: string[] } {
        const paramKeys = Object.keys(queryParams);
        
        if (paramKeys.length <= MAX_PARAMS) {
            return { params: queryParams, notes: [] };
        }

        const limitedKeys = paramKeys.slice(0, MAX_PARAMS);
        const limitedParams = limitedKeys.reduce((acc, key) => {
            acc[key] = queryParams[key];
            return acc;
        }, {} as Record<string, any>);

        const notes = [`Only first ${MAX_PARAMS} of ${paramKeys.length} params saved`];

        return { params: limitedParams, notes };
    }

    private buildEventData(
        pixelId: string,
        timestamp: number,
        ipInfo: IIpInfo,
        uaInfo: IUserAgentInfo,
        params: Record<string, any>,
        notes: string[]
    ): Omit<IPixelEvent, "id" | "params"> & { params: string } {
        return {
            pixel_id: pixelId,
            timestamp,
            ip_hash: ipInfo.ipHash,
            country: ipInfo.country,
            region: ipInfo.region,
            browser: uaInfo.browser,
            os: uaInfo.os,
            device_type: uaInfo.deviceType,
            params: JSON.stringify(params),
            notes: notes.length > 0 ? notes.join("; ") : null
        };
    }

    private incrementCount(counts: Record<string, number>, key: string): void {
        counts[key] = (counts[key] || 0) + 1;
    }

    private processEventCounts(event: IPixelEvent, ipCounts: Record<string, number>): boolean {
        this.incrementCount(ipCounts, event.ip_hash);
        return (ipCounts[event.ip_hash] ?? 0) > 1;
    }

    private aggregateDistributions(
        event: IPixelEvent,
        countryCounts: Record<string, number>,
        deviceTypeCounts: Record<string, number>,
        osCounts: Record<string, number>,
        browserCounts: Record<string, number>
    ): void {
        if (event.country) this.incrementCount(countryCounts, event.country);
        if (event.device_type) this.incrementCount(deviceTypeCounts, event.device_type);
        if (event.os) this.incrementCount(osCounts, event.os);
        if (event.browser) this.incrementCount(browserCounts, event.browser);
    }

    private aggregateParams(params: Record<string, any>, paramCounts: Record<string, Record<string, number>>): void {
        if (!params || Object.keys(params).length === 0) return;

        for (const key of Object.keys(params)) {
            paramCounts[key] = paramCounts[key] || {};
            const value = String(params[key]);
            this.incrementCount(paramCounts[key], value);
        }
    }

    private buildPublicEvent(event: IPixelEvent, isReturning: boolean): IPixelEventPublic {
        const params = event.params && typeof event.params === 'object' ? event.params : {};

        return {
            timestamp: event.timestamp,
            isReturning,
            country: event.country ?? null,
            region: event.region ?? null,
            browser: event.browser ?? null,
            os: event.os ?? null,
            deviceType: event.device_type ?? null,
            params: params,
            notes: event.notes ?? null
        };
    }

    private calculateUserStats(ipCounts: Record<string, number>, totalEvents: number): {
        uniqueUsers: number;
        returningUsers: number;
        newUsers: number;
        eventsPerUser: number;
    } {
        const uniqueUsers = Object.keys(ipCounts).length;
        const returningUsers = Object.values(ipCounts).filter(c => c > 1).length;
        const newUsers = uniqueUsers - returningUsers;
        const eventsPerUser = uniqueUsers > 0 ? parseFloat((totalEvents / uniqueUsers).toFixed(1)) : 0;

        return { uniqueUsers, returningUsers, newUsers, eventsPerUser };
    }

    private buildParameterRows(paramCounts: Record<string, Record<string, number>>): Array<{ parameter: string; value: string; count: number }> {
        const parameterRows: Array<{ parameter: string; value: string; count: number }> = [];

        for (const [param, valueCounts] of Object.entries(paramCounts)) {
            for (const [value, count] of Object.entries(valueCounts)) {
                parameterRows.push({
                    parameter: param,
                    value: value,
                    count: count as number
                });
            }
        }

        parameterRows.sort((a, b) => {
            if (a.parameter !== b.parameter) {
                return a.parameter.localeCompare(b.parameter);
            }
            return b.count - a.count;
        });

        return parameterRows;
    }
}