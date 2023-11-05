import { util } from "../utils/util"

type LocalCache = {
    expired: number,
    data: any
}

class CacheService {

    private readonly defaultTTL = 30 * 60 * 1000
    private readonly cacheExpiringInterval = 1000
    private readonly cacheMap = new Map<string, any>()

    constructor() {
        /* c8 ignore start */
        setTimeout(async () => {
            await this.cacheExpiringAsync()
        }, this.cacheExpiringInterval)
        /* c8 ignore end */
    }

    /**
     * Cache storing
     * @param key key
     * @param data data
     * @param ttl time to live second(s). -1 if never expired
     * @returns 1 if succeed
     * @returns -1 if failed
     */
    async trySetAsync(key: string, data: any, ttl: number = this.defaultTTL): Promise<number> {
        try {
            let expired = -1

            if (ttl > 0) {
                const timestamp = util.timestampUtcNow()
                expired = timestamp + (ttl * 1000)
            }

            const cache: LocalCache = {
                expired,
                data
            }

            this.cacheMap.set(key, cache)

            return 1

            /* c8 ignore start */
        } catch (err) {
            return -1
            /* c8 ignore end */
        }
    }

    /**
     * Cache retrieving
     * @param key key
     * @returns data
     * @returns undefined if key not found
     */
    async tryGetAsync<T>(key: string): Promise<T> {

        if (this.cacheMap.has(key)) {
            return this.cacheMap.get(key).data as T
        }

        return undefined as T
    }

    /**
     * Cache deleting
     * @returns 1 if key deleted
     * @returns 0 if key not found
     * @returns -1 if failed
     */
    async tryExpiredAsync(key: string): Promise<number> {
        try {
            if (this.cacheMap.has(key)) {
                this.cacheMap.delete(key)
                return 1
            }
            return 0

        } catch (err) {
            return -1
        }
    }

    private async cacheExpiringAsync() {

        const now = util.timestampUtcNow()

        this.cacheMap.forEach(async (value: LocalCache, key: string) => {
            if (value.expired > -1) {
                if (now > value.expired) {
                    await this.tryExpiredAsync(key)
                    console.log(`'${key}' cache expired.`)
                }
            }
        })

        setTimeout(async () => {
            await this.cacheExpiringAsync()
        }, this.cacheExpiringInterval)
    }

}

export const cacheService = new CacheService()

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest

    beforeEach(async (_) => {
    })

    describe("#cache-service.ts", () => {

        const test1 = ".trySetAsync <=> tryGetAsync"
        test.concurrent(test1, async () => {
            console.time(test1)

            const value = "value1"

            await cacheService.trySetAsync(test1, value)

            expect(await cacheService.tryGetAsync(test1)).toEqual(value)

            console.timeEnd(test1)
        })

        const test2 = ".trySetAsync expired"
        test.concurrent(test2, async () => {
            console.time(test2)

            const value = "value2"

            await cacheService.trySetAsync(test2, value, 1)

            expect(await cacheService.tryGetAsync(test2)).toEqual(value)

            await util.delay(2000)

            expect(await cacheService.tryGetAsync(test2)).toBeUndefined()

            console.timeEnd(test2)
        })

        const test3 = ".trySetAsync never expired"
        test.concurrent(test3, async () => {
            console.time(test3)

            const value = "value3"

            await cacheService.trySetAsync(test3, value, -1)

            expect(await cacheService.tryGetAsync(test3)).toEqual(value)

            await util.delay(2000)

            console.timeEnd(test3)
        })

    })
}