declare module 'ejs' {
    export function renderFile(path: string, data: any, options?: any, callback?: (err: Error | null, str?: string) => void): any;
    export default { renderFile };
}
