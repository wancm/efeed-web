import { ObjectId } from "mongodb";

declare module 'vitest' {
    export interface TestContext {
        productIds: ObjectId[],
        shopIds: ObjectId[],
        businessUnitIds: ObjectId[],
        products: any[],
        shops: any[],
        businessUnits: any[],
        param1: string,
        param2: string,
        param3: string,
    }
}