import { z } from "zod"
import { fromZodError } from "zod-validation-error"
import { ImageDtoSchema, ImageEntitySchema } from "./image"
import { mongodbUtil } from "@/libs/server/core/db/mongodb/mongodb-util"

const MainProductEntitySchema = z.object({
    id: z.string().nullable(),
    name: z.string().max(100).min(3),
    code: z.string().max(20).optional(),
    price: z.number().default(0),
    currencyCode: z.string().max(3),
    image: ImageEntitySchema.optional()
})

const SubProductEntitySchema = z.object({
    products: z.array(MainProductEntitySchema).optional()
})

export const ProductEntitySchema = MainProductEntitySchema.merge(SubProductEntitySchema)

// Database Entities
export type ProductEntity = z.infer<typeof ProductEntitySchema>


const MainProductDtoSchema = z.object({
    id: z.string().nullish(),
    name: z.string().nullish(),
    code: z.string().nullish(),
    price: z.number().nullish(),
    currencyCode: z.string().nullish(),
    image: ImageDtoSchema.nullish()
})

const SubProductDtoSchema = z.object({
    products: z.array(MainProductDtoSchema).optional()
})

export const ProductDtoSchema = MainProductDtoSchema.merge(SubProductDtoSchema)

// Application DTO
export type Product = z.infer<typeof ProductDtoSchema>

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

