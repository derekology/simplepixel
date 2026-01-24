const UAParser = require("ua-parser-js");

import type { IUserAgentInfo } from "../types/types";

function processUserAgent(userAgent: string): IUserAgentInfo {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    let deviceType: "Mobile" | "Tablet" | "Desktop" = "Desktop";
    if (result.device.type === "mobile") deviceType = "Mobile";
    else if (result.device.type === "tablet") deviceType = "Tablet";

    return {
        browser: result.browser.name ?? null,
        os: result.os.name ?? null,
        deviceType
    };
}

module.exports = {
    processUserAgent
};
