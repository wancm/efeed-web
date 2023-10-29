class AppSettings {

    private readonly isProdVal: boolean = true;

    /**
     * @returns true if ENVIRONMENT === 'prod'
     */
    get isProd(): boolean {
        return this.isProdVal;
    }

    public readonly systemId = '653e5a8d41ed3eaa02c42f8b';

    constructor() {
        this.isProdVal = process.env.ENVIRONMENT === 'prod';
    }
}

export const appSettings = new AppSettings();

if (import.meta.vitest) {
    const { describe, expect, test } = import.meta.vitest;

    describe("# util.ts", () => {
        const test1 = '.isProd';
        test.concurrent(test1, async () => {
            console.time(test1);

            expect(appSettings.isProd).toBeFalsy();

            console.timeEnd(test1);
        })
    })
}