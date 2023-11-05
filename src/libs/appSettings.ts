import { util } from "@/libs/shared/utils/util"

class AppSettings {

    private readonly isProdVal: boolean = true

    // default value 01/01/1970 00:00:00. Same as C#
    private readonly defaultDateVal: Date = new Date(1970, 0, 1, 0, 0, 0, 0)

    /**
     * @returns true if ENVIRONMENT === 'prod'
     */
    get isProd(): boolean {
        return this.isProdVal
    }

    get defaultDate(): Date {
        return this.defaultDateVal
    }

    public readonly systemId = "653e5a8d41ed3eaa02c42f8b"

    constructor() {
        this.isProdVal = process.env.ENVIRONMENT === "prod"
    }
}

export const appSettings = new AppSettings()

if (import.meta.vitest) {
    const { describe, expect, test } = import.meta.vitest

    describe("# util.ts", () => {
        const test1 = ".isProd"
        test.concurrent(test1, async () => {
            console.time(test1)

            expect(appSettings.isProd).toBeFalsy()

            console.timeEnd(test1)
        })

        const test2 = ".defaultDate"
        test.concurrent(test2, async () => {
            console.time(test2)

            util.dateToTimestamp(appSettings.defaultDate)
            expect(appSettings.defaultDate).not.toBeUndefined()

            console.timeEnd(test2)
        })
    })
}