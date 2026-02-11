import { UAParser } from "ua-parser-js";
import type { IUserAgentInfo } from "../types/types.js";

function processUserAgent(userAgent: string): IUserAgentInfo {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    let deviceType: "Mobile" | "Tablet" | "Desktop" = "Desktop";
    if (result.device.type === "mobile") deviceType = "Mobile";
    else if (result.device.type === "tablet") deviceType = "Tablet";

    // const osName = result.os.name ?? null;
    // const osVersion = result.os.version ?? null;
    // const os = osName && osVersion ? `${osName} ${osVersion}` : osName;

    // const browserName = result.browser.name ?? null;
    // const browserVersion = result.browser.version ?? null;
    // const browser = browserName && browserVersion ? `${browserName} ${browserVersion}` : browserName;

    return {
        browser: result.browser.name || "Unknown",
        os: result.os.name || "Unknown",
        deviceType
    };
}

export { processUserAgent };
