const crypto = require("crypto");
const geoip = require("geoip-lite");

import type { IIpInfo } from "../types/types";

const COUNTRY_CODE_TO_NAME: Record<string, string> = {
    'US': 'United States',
    'CA': 'Canada',
    'GB': 'United Kingdom',
    'DE': 'Germany',
    'FR': 'France',
    'IT': 'Italy',
    'ES': 'Spain',
    'AU': 'Australia',
    'JP': 'Japan',
    'CN': 'China',
    'IN': 'India',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'RU': 'Russia',
    'KR': 'South Korea',
    'NL': 'Netherlands',
    'BE': 'Belgium',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'PL': 'Poland',
    'CH': 'Switzerland',
    'AT': 'Austria',
    'PT': 'Portugal',
    'GR': 'Greece',
    'TR': 'Turkey',
    'ZA': 'South Africa',
    'AR': 'Argentina',
    'CL': 'Chile',
    'CO': 'Colombia',
    'PE': 'Peru',
    'VE': 'Venezuela',
    'EG': 'Egypt',
    'NG': 'Nigeria',
    'KE': 'Kenya',
    'TH': 'Thailand',
    'VN': 'Vietnam',
    'PH': 'Philippines',
    'ID': 'Indonesia',
    'MY': 'Malaysia',
    'SG': 'Singapore',
    'NZ': 'New Zealand',
    'IE': 'Ireland',
    'CZ': 'Czech Republic',
    'HU': 'Hungary',
    'RO': 'Romania',
    'UA': 'Ukraine',
    'IL': 'Israel',
    'SA': 'Saudi Arabia',
    'AE': 'United Arab Emirates',
    'PK': 'Pakistan',
    'BD': 'Bangladesh',
};

function hashIp(ip: string): string {
    return crypto
        .createHash("sha256")
        .update(ip)
        .digest("hex");
}

function processIp(ip: string): IIpInfo {
    const geo = geoip.lookup(ip);
    
    const countryCode = geo?.country;
    const countryName = countryCode ? (COUNTRY_CODE_TO_NAME[countryCode] || countryCode) : "Unknown";

    return {
        ipHash: hashIp(ip),
        country: countryName,
        region: geo?.region ?? "Unknown"
    };
}

module.exports = {
    processIp
};
