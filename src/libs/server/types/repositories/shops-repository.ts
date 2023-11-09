import { ObjectId } from "mongodb"
import { Shop } from "@/libs/shared/types/shop"

export type ShopsRepository = {
    loadOneAsync(objId: ObjectId): Promise<Shop>

    loadByBusinessUnitIdAsync(businessUnitId: ObjectId): Promise<Shop[]>

    saveAsync(shop: Shop, createdBy: string): Promise<ObjectId>
}