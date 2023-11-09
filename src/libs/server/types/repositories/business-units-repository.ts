import { ObjectId } from "mongodb"
import { BusinessUnit } from "@/libs/shared/types/business-unit"

export type BusinessUnitsRepository = {
    loadOneAsync(objId: ObjectId): Promise<BusinessUnit>

    loadManyAsync(objIds: ObjectId[]): Promise<BusinessUnit[]>

    saveAsync(businessUnit: BusinessUnit, createdBy: string): Promise<ObjectId>
}