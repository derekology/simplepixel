const crypto = require("crypto");
const geoip = require("geoip-lite");

function hashIp(ip: string): string {
    return crypto
        .createHash("sha256")
        .update(ip)
        .digest("hex");
}

function processIp(ip: string) {
    const geo = geoip.lookup(ip);

    return {
        ipHash: hashIp(ip),
        country: geo?.country ?? null,
        region: geo?.region ?? null
    };
}

module.exports = {
    processIp
};
