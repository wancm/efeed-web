import { ZodObject } from "zod";
import { util } from "./utils/util";

export enum ZodPropConfigType {
    min = 'min',
    max = 'max'
}

declare global {
    interface String {
        equalCaseIgnored(compareVal: string): boolean;
        isNilOrEmpty(): boolean;
    }

    interface Object {
        toNullString(): string;
        zSchemaMin(): number;
        zSchemaMax(): number;
    }
}

String.prototype.equalCaseIgnored = function (compareVal: string): boolean {
    if (this && !compareVal) return false;
    if (!this && compareVal) return false;

    return this.toUpperCase() === compareVal.toUpperCase();
}

String.prototype.isNilOrEmpty = function (): boolean {
    if (util.isNil(this)) return true;
    return this.trim().length === 0;
}

Object.prototype.toNullString = function (): string {
    if (util.isNil(this)) return '';
    return util.toNullString(this as string);
}

ZodObject.prototype.zSchemaMin = function (): number {
    // https://stackoverflow.com/questions/73792237/how-get-values-inside-min-max-in-zod
    const value = readZodSchema(this, 'min');
    if (value) return value as number;
    return -1;
}

ZodObject.prototype.zSchemaMax = function (): number {
    // https://stackoverflow.com/questions/73792237/how-get-values-inside-min-max-in-zod
    const value = readZodSchema(this, 'max');
    if (value) return value as number;
    return -1;
}

const readZodSchema = (z: any, prop: string): any => {
    const found = z?.shape?.name?._def?.checks?.find(({ kind }: any) => (kind as string) === prop);
    if (found) return found.value;
    return undefined;
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

        const test2 = '.isNilOrEmpty()';
        test.concurrent(test2, async () => {
            console.time(test2);

            expect(' '.isNilOrEmpty()).toBeTruthy();
            expect(''.isNilOrEmpty()).toBeTruthy();

            expect('a'.isNilOrEmpty()).toBeFalsy();

            console.timeEnd(test2);
        })

        const test3 = '.toNullString()';
        test.concurrent(test3, async () => {
            console.time(test3);

            const a = 'null';

            expect(a.toNullString()).toEqual('null');

            console.timeEnd(test3);
        })
    })
}