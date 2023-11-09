import { ObjectId } from "mongodb"
import { Product } from "@/libs/shared/types/product"

export type ProductRepository = {
    loadOneAsync(objId: ObjectId): Promise<Product>

    loadByBusinessUnitIdAsync(businessUnitId: ObjectId): Promise<Product[]>

    saveAsync(product: Product, createdBy: string): Promise<ObjectId>
}