const sum = (...numbers: number[]) => {
    return numbers.reduce((total, number) => total + number, 0)
}

if (import.meta.vitest) {

    const { describe, expect, it } = import.meta.vitest;
    describe("#sum", () => {
        it.concurrent('returns 0 with no numbers', () => {
            expect(sum()).toBe(0)
        })

        it.concurrent('returns same number with 1 number', () => {
            expect(sum(1)).toBe(1)
        })

        it.concurrent('returns sum number with multiple numbers', () => {
            expect(sum(1, 2, 3)).toBe(6)
        })
    })
}

export default sum;

