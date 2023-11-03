import { util } from "./utils/util";

declare global {
    interface String {
        equalCaseIgnored(compareVal: string): boolean;
    }

    interface Object {
        toNullString(): string;
    }
}

String.prototype.equalCaseIgnored = function (compareVal: string): boolean {
    if (this && !compareVal) return false;
    if (!this && compareVal) return false;

    return this.toUpperCase() === compareVal.toUpperCase();
}

Object.prototype.toNullString = function (): string {
    if (util.isNil(this)) return '';
    return util.toNullString(this as string);
}

export { };

if (import.meta.vitest) {
    const { describe, expect, test, vi } = import.meta.vitest;

    describe("# extension.ts", () => {
        const test1 = '.equalCaseIgnored()';
        test.concurrent(test1, async () => {
            console.time(test1);

            expect('undefined'.equalCaseIgnored('undefined')).toBeTruthy();
            expect('undefined'.equalCaseIgnored('UnDeFiNeD')).toBeTruthy();
            expect(''.equalCaseIgnored('')).toBeTruthy();
            expect(' '.equalCaseIgnored(' ')).toBeTruthy();

            expect(''.equalCaseIgnored('    ')).toBeFalsy();

            console.timeEnd(test1);
        })

        const test2 = '.toNullString()';
        test.concurrent(test2, async () => {
            console.time(test2);

            const a = 'null';

            expect(a.toNullString()).toEqual('null');

            console.timeEnd(test2);
        })
    })
}