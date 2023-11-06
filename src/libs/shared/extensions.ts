import { ZodObject } from "zod"
import { util } from "@/libs/shared/utils/util"
import { ObjectId } from "mongodb"
import { mongodbUtil } from "@/libs/server/data/mongodb/mongodb-util"

export enum ZodPropConfigType {
    min = "min",
    max = "max"
}

declare global {
    interface String {
        /**
         * String case ignored equality comparison.
         * @param compareVal string to compare with
         */
        isEqual(compareVal: string): boolean;

        isNilOrEmpty(): boolean;

        toNullString(): string;

        toNumber(): number;

        toObjectId(): ObjectId;

        toDate(): Date;
    }

    interface Object {
        zSchemaMin(): number;

        zSchemaMax(): number;
    }
}

String.prototype.isEqual = function (compareVal: string): boolean {
    if (this && !compareVal) return false
    if (!this && compareVal) return false

    return this.toUpperCase() === compareVal.toUpperCase()
}

String.prototype.isNilOrEmpty = function (): boolean {
    if (util.isNil(this)) return true
    return this.trim().length === 0
}

String.prototype.toNullString = function (): string {
    if (util.isNil(this)) return ""
    return util.toNullString(this as string)
}

String.prototype.toNumber = function (): number {
    if (util.isStrEmpty(this)) return 0
    return parseFloat(this as string)
}

String.prototype.toObjectId = function (): ObjectId {
    if (util.isStrEmpty(this)) return undefined as any
    return mongodbUtil.genId(this.toString())
}

String.prototype.toDate = function (): Date {
    if (util.isStrEmpty(this)) return undefined as any

    // YYYYMMDD
    if (this.length === 8) return new Date(this.substring(0, 4).toNumber(),
        this.substring(4, 6).toNumber() - 1,
        this.substring(6, 8).toNumber()
        , 0, 0, 0, 0)

    return new Date(this as string)
}

ZodObject.prototype.zSchemaMin = function (): number {
    // https://stackoverflow.com/questions/73792237/how-get-values-inside-min-max-in-zod
    const value = readZodSchema(this, "min")
    if (value) return value as number
    return -1
}

ZodObject.prototype.zSchemaMax = function (): number {
    // https://stackoverflow.com/questions/73792237/how-get-values-inside-min-max-in-zod
    const value = readZodSchema(this, "max")
    if (value) return value as number
    return -1
}

const readZodSchema = (z: any, prop: string): any => {
    const found = z?.shape?.name?._def?.checks?.find(({ kind }: any) => (kind as string) === prop)
    if (found) return found.value
    return undefined
}

export const extensions = {}

if (import.meta.vitest) {
    const { describe, expect, test, vi } = import.meta.vitest

    describe("# extension.ts", () => {
        const test1 = ".isEqual()"
        test.concurrent(test1, async () => {
            console.time(test1)

            expect("undefined".isEqual("undefined")).toBeTruthy()
            expect("undefined".isEqual("UnDeFiNeD")).toBeTruthy()
            expect("".isEqual("")).toBeTruthy()
            expect(" ".isEqual(" ")).toBeTruthy()

            expect("".isEqual("    ")).toBeFalsy()

            console.timeEnd(test1)
        })

        const test2 = ".isNilOrEmpty()"
        test.concurrent(test2, async () => {
            console.time(test2)

            expect(" ".isNilOrEmpty()).toBeTruthy()
            expect("".isNilOrEmpty()).toBeTruthy()

            expect("a".isNilOrEmpty()).toBeFalsy()

            console.timeEnd(test2)
        })

        const test3 = ".toNullString()"
        test.concurrent(test3, async () => {
            console.time(test3)

            const a = "null"

            expect(a.toNullString()).toEqual("null")

            console.timeEnd(test3)
        })

        const test4 = ".toNumber()"
        test.concurrent(test4, async () => {
            console.time(test4)

            expect("   ".toNumber()).toEqual(0)
            expect("".toNumber()).toEqual(0)
            expect("0".toNumber()).toEqual(0)
            expect("05.45634".toNumber()).toEqual(5.45634)
            expect("2.1235".toNumber()).toEqual(2.1235)
            expect("43435".toNumber()).toEqual(43435)

            console.timeEnd(test4)
        })

        const test5 = ".toObjectId()"
        test.concurrent(test5, async () => {
            console.time(test5)

            const objId = new ObjectId()

            const objId2 = objId.toHexString().toObjectId()

            expect(objId).toEqual(objId2)

            console.timeEnd(test5)
        })

        const test6 = ".toDate()"
        test.concurrent(test6, async () => {
            console.time(test6)

            const dateStr = "19820526"

            const date = dateStr.toDate()

            expect(date).toEqual(new Date(1982, 4, 26, 0, 0, 0, 0))

            console.timeEnd(test6)
        })
    })
}