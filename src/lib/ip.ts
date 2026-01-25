const crypto = require("crypto");
const geoip = require("geoip-lite");

import type { IIpInfo } from "../types/types";

function hashIp(ip: string): string {
    return crypto
        .createHash("sha256")
        .update(ip)
        .digest("hex");
}

function processIp(ip: string): IIpInfo {
    const geo = geoip.lookup(ip);

    return {
        ipHash: hashIp(ip),
        country: geo?.country ?? "Unknown",
        region: geo?.region ?? "Unknown"
    };
}

module.exports = {
    processIp
};
