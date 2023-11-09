export type CacheService = {

    /**
     * Cache data store
     * @param key key
     * @param data data
     * @param ttl time to live second(s). -1 if never expired
     * @returns 1 if succeed
     * @returns -1 if failed
     */
    trySetAsync(key: string, data: any, ttl: number): Promise<number>

    /**
     * Cache data retrieve
     * @param key key
     * @returns data
     * @returns undefined if key not found
     */
    tryGetAsync<T>(key: string): Promise<T>


    /**
     * Cache data delete
     * @returns 1 if key deleted
     * @returns 0 if key not found
     * @returns -1 if failed
     */
    tryExpiredAsync(key: string): Promise<number>

    /**
     * Extend cache expiry
     * @param key key
     * @param ttl time to live second(s). -1 if never expired
     */
    extendExpiryAsync(key: string, ttl: number): Promise<number>
}