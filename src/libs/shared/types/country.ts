import { z } from "zod"
import { mongodbUtil } from "@/libs/server/core/db/mongodb/mongodb-util"
import { fromZodError } from "zod-validation-error"
import { Product, ProductDtoSchema, ProductEntity, ProductEntitySchema } from "@/libs/shared/types/product"

export const CurrencyEntitySchema = z.object({
    code: z.string().min(2).max(3),
    minorUnit: z.union([z.literal(2), z.literal(3)]).default(2),
    symbol: z.string().optional(),
    name: z.string().optional(),
    symbolNative: z.string().optional(),
    rounding: z.string().optional(),
    namePlural: z.string().optional()
})

export const CountryEntitySchema = z.object({
    code: z.string().min(2),
    name: z.string().max(200),
    currency: CurrencyEntitySchema.optional(),
    callingCode: z.number().optional()
})

// // Database Entities
// export type CurrencyEntity = z.infer<typeof CurrencyEntitySchema>
// export type CountryEntity = z.infer<typeof CountryEntitySchema>

export const CurrencyDtoSchema = z.object({
    code: z.string(),
    minorUnit: CurrencyEntitySchema.shape.minorUnit,
    symbol: z.string().nullish(),
    name: z.string().nullish(),
    symbolNative: z.string().nullish(),
    rounding: z.string().nullish(),
    namePlural: z.string().nullish()
})

export const CountryDtoSchema = z.object({
    code: z.string(),
    name: z.string().nullish(),
    currency: CurrencyDtoSchema.nullish(),
    callingCode: z.number().nullish()
})

// Application DTO
// cm: reusing entity schema here since both are exactly the same
export type Currency = z.infer<typeof CurrencyDtoSchema>
export type Country = z.infer<typeof CountryDtoSchema>

export const productConverter = {
    toEntity(dto: Product): ProductEntity {

        const productEntity = {
            id: mongodbUtil.genId(dto.id).toHexString(),
            name: dto.name,
            code: dto.code,
            price: dto.price,
            currencyCode: dto.currencyCode,
            image: dto.image
        }

        const result = ProductEntitySchema.safeParse(productEntity)
        if (result.success) {
            return result.data
            /* c8 ignore start */
        } else {
            const zodError = fromZodError(result.error)
            console.log("validation error", JSON.stringify(zodError))
            throw new Error("ProductEntitySchema validation error")
            /* c8 ignore end */
        }
    },

    toDTO(entity: ProductEntity): Product {
        const productDTO: Product = {
            id: entity.id,
            name: entity.name,
            code: entity.code,
            price: entity.price,
            currencyCode: entity.currencyCode,
            image: entity.image
        }

        const result = ProductDtoSchema.safeParse(productDTO)
        if (result.success) {
            return result.data
            /* c8 ignore start */
        } else {
            const zodError = fromZodError(result.error)
            console.log("validation error", JSON.stringify(zodError))
            throw new Error("ProductEntitySchema validation error")
            /* c8 ignore end */
        }
    },
}