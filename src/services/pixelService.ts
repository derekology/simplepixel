const { v4: uuidv4 } = require("uuid");

const repository = require("../repos/sqlite3");
const { processIp } = require("../lib/ip");
const { processUserAgent } = require("../lib/userAgent");
const { MAX_PARAMS } = require("../lib/schema");

import type { IPixelEvent, IIpInfo, IUserAgentInfo } from "../types/types";

const PIXEL_EXPIRY_DAYS = parseInt(process.env.PIXEL_EXPIRY_DAYS || "7", 10);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function createPixel() {
    const pixelId = uuidv4();
    const now = Date.now();
    const expires = now + PIXEL_EXPIRY_DAYS * MS_PER_DAY;
    repository.createPixel(pixelId, now, expires);
    return pixelId;
}

function limitParams(queryParams: Record<string, any>) {
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

function buildEventData(
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

function recordPixelEvent(pixelId: string, ip: string, userAgent: string, queryParams: Record<string, any>) {
    const timestamp = Date.now();
    const pixel = repository.getPixelById(pixelId);

    if (!pixel || timestamp >= pixel.expires_at) return;

    const ipInfo = processIp(ip) as IIpInfo;
    const uaInfo = processUserAgent(userAgent) as IUserAgentInfo;
    const { params: limitedParams, notes: notesArray } = limitParams(queryParams);

    const event = buildEventData(pixelId, timestamp, ipInfo, uaInfo, limitedParams, notesArray);

    repository.createEvent(event);
}

function incrementCount(counts: Record<string, number>, key: string) {
    counts[key] = (counts[key] || 0) + 1;
}

function processEventCounts(event: IPixelEvent, ipCounts: Record<string, number>) {
    incrementCount(ipCounts, event.ip_hash);
    return (ipCounts[event.ip_hash] ?? 0) > 1;
}

function aggregateDistributions(
    event: IPixelEvent,
    countryCounts: Record<string, number>,
    regionCounts: Record<string, number>,
    deviceTypeCounts: Record<string, number>,
    osCounts: Record<string, number>,
    browserCounts: Record<string, number>
) {
    if (event.country) incrementCount(countryCounts, event.country);
    if (event.region) incrementCount(regionCounts, event.region);
    if (event.device_type) incrementCount(deviceTypeCounts, event.device_type);
    if (event.os) incrementCount(osCounts, event.os);
    if (event.browser) incrementCount(browserCounts, event.browser);
}

function aggregateParams(params: Record<string, any>, paramCounts: Record<string, Record<string, number>>) {
    if (!params || Object.keys(params).length === 0) return;

    for (const key of Object.keys(params)) {
        paramCounts[key] = paramCounts[key] || {};
        const value = String(params[key]);
        incrementCount(paramCounts[key], value);
    }
}

function buildPublicEvent(event: IPixelEvent, isReturning: boolean) {
    const params = event.params && typeof event.params === 'object' ? event.params : {};

    return {
        timestamp: event.timestamp,
        isReturning,
        country: event.country,
        region: event.region,
        browser: event.browser,
        os: event.os,
        deviceType: event.device_type,
        params: params,
        notes: event.notes ?? null
    };
}

function calculateUserStats(ipCounts: Record<string, number>, totalEvents: number) {
    const uniqueUsers = Object.keys(ipCounts).length;
    const returningUsers = Object.values(ipCounts).filter(c => c > 1).length;
    const newUsers = uniqueUsers - returningUsers;
    const eventsPerUser = uniqueUsers > 0 ? parseFloat((totalEvents / uniqueUsers).toFixed(1)) : 0;

    return { uniqueUsers, returningUsers, newUsers, eventsPerUser };
}

function buildParameterRows(paramCounts: Record<string, Record<string, number>>) {
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

function getPixelStats(pixelId: string) {
    const pixel = repository.getPixelById(pixelId);
    if (!pixel) return null;

    const events = repository.getEventsByPixelId(pixelId);

    const ipCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};
    const regionCounts: Record<string, number> = {};
    const deviceTypeCounts: Record<string, number> = {};
    const osCounts: Record<string, number> = {};
    const browserCounts: Record<string, number> = {};
    const paramCounts: Record<string, Record<string, number>> = {};
    const publicEvents: any[] = [];

    for (const event of events) {
        const isReturning = processEventCounts(event, ipCounts);

        aggregateDistributions(event, countryCounts, regionCounts, deviceTypeCounts, osCounts, browserCounts);

        const params = event.params && typeof event.params === 'object' ? event.params : {};
        aggregateParams(params, paramCounts);

        publicEvents.push(buildPublicEvent(event, isReturning));
    }

    const { uniqueUsers, returningUsers, newUsers, eventsPerUser } = calculateUserStats(ipCounts, events.length);
    const parameterRows = buildParameterRows(paramCounts);

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
            regionCounts,
            deviceTypeCounts,
            osCounts,
            browserCounts,
            parameterRows
        }
    };
}

function deletePixel(pixelId: string) {
    const pixel = repository.getPixelById(pixelId);
    if (!pixel) return false;
    
    repository.deletePixel(pixelId);
    return true;
}

module.exports = {
    createPixel,
    recordPixelEvent,
    getPixelStats,
    deletePixel
};