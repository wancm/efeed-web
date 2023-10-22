class Util {
    /**
     * Check if obj is null or undefined
     */
    isNil(val: unknown): boolean {
        // https://builtin.com/software-engineering-perspectives/javascript-null-check
        return val === undefined || val === null
    }

    /**
     * Check if string.trim() is empty
     * @param val value to be check
     */
    isEmptyStr(val: string): boolean {
        if (this.isNil(val)) return true
        if (val.trim().length === 0) return true
        return false
    }

    /**
     * Check if the array isNil or empty
     * @param val value to be check
     * @returns 
     */
    isEmptyArr(val: unknown): boolean {
        if (this.isNil(val)) return true
        if (!Array.isArray(val)) throw Error('@val is not an array')
        return val.length === 0;
    }
}

export const util = new Util();