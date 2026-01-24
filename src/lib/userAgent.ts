const UAParser = require("ua-parser-js");

function processUserAgent(userAgent: string) {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    let deviceType = "desktop";
    if (result.device.type === "mobile") deviceType = "mobile";
    else if (result.device.type === "tablet") deviceType = "tablet";

    return {
        browser: result.browser.name ?? null,
        os: result.os.name ?? null,
        deviceType
    };
}

module.exports = {
    processUserAgent
};
