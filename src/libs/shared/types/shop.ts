import { ObjectId } from "mongodb"
import { z } from "zod"
import { fromZodError } from "zod-validation-error"
import { util } from "@/libs/shared/utils/util"
import { mongodbUtil } from "@/libs/server/core/db/mongodb/mongodb-util"
import { appSettings } from "@/libs/appSettings"


export const ShopEntitySchema = z.object({
    _id: z.instanceof(ObjectId),
    businessUnitId: z.instanceof(ObjectId),
    name: z.string().max(100).min(3),
    personIds: z.array(z.instanceof(ObjectId)).optional(),
    productIds: z.array(z.instanceof(ObjectId)).optional(),
    createdBy: z.instanceof(ObjectId),
    createdDate: z.date().default(util.utcNow()),
    updatedBy: z.string().max(100).optional(),
    updatedDate: z.date().default(util.utcNow()).optional(),
    _ts: z.number().default(util.timestampUtcNow()),
})

// Database Entities
export type ShopEntity = z.infer<typeof ShopEntitySchema>

// Application DTO
export const ShopDTOSchema = z.object({
    id: z.string().optional(),
    businessUnitId: z.string(),
    name: z.string().nullish(),
    personIds: z.array(z.string()).nullish(),
    productIds: z.array(z.string()).nullish(),
})

export type Shop = z.infer<typeof ShopDTOSchema>;

export const shopConverter = {
    toEntity(dto: Shop, createdBy: string): ShopEntity {

        const entity = {
            _id: mongodbUtil.genId(dto.id),
            businessUnitId: dto.businessUnitId.toObjectId(),
            name: dto.name,
            personIds: dto.personIds?.map(id => id.toObjectId()),
            productIds: !util.isArrEmpty(dto.productIds) ?
                dto.productIds.map(id => id.toObjectId())
                : [],
            createdBy: createdBy ? mongodbUtil.genIdIfNotNil(createdBy) : mongodbUtil.genIdIfNotNil(appSettings.systemId)
        }

        const result = ShopEntitySchema.safeParse(entity)
        if (result.success) {
            return result.data
            /* c8 ignore start */
        } else {
            const zodError = fromZodError(result.error)
            console.log("validation error", JSON.stringify(zodError))
            throw new Error("ShopEntitySchema validation error")
            /* c8 ignore end */
        }
    },

    toDTO(entity: ShopEntity): Shop {

        const dto: Shop = {
            id: entity._id.toHexString(),
            businessUnitId: entity.businessUnitId.toHexString(),
            name: entity.name,
            personIds: entity.personIds?.map(id => id.toHexString()),
            productIds: entity.productIds?.map(id => id.toHexString())
        }

        const result = ShopDTOSchema.safeParse(dto)

        if (result.success) {
            return result.data
            /* c8 ignore start */
        } else {
            const zodError = fromZodError(result.error)
            console.log("validation error", JSON.stringify(zodError))
            throw new Error("ShopDTOSchema validation error")
            /* c8 ignore end */
        }
    },
}

