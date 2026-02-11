declare module 'ua-parser-js' {
    interface IResult {
        ua: string;
        browser: {
            name?: string;
            version?: string;
            major?: string;
        };
        engine: {
            name?: string;
            version?: string;
        };
        os: {
            name?: string;
            version?: string;
        };
        device: {
            vendor?: string;
            model?: string;
            type?: string;
        };
        cpu: {
            architecture?: string;
        };
    }

    export class UAParser {
        constructor(userAgent?: string);
        getResult(): IResult;
        getBrowser(): IResult['browser'];
        getDevice(): IResult['device'];
        getEngine(): IResult['engine'];
        getOS(): IResult['os'];
        getCPU(): IResult['cpu'];
        getUA(): string;
        setUA(userAgent: string): UAParser;
    }
}
