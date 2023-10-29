import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { ImageEntitySchema } from './image';

const MainProductEntitySchema = z.object({
    id: z.string().optional(),
    name: z.string().max(100).min(3),
    code: z.string().max(20).optional(),
    price: z.number().default(0),
    currencyCode: z.string().max(3),
    image: ImageEntitySchema.optional()
})

const SubProductEntitySchema = z.object({
    products: z.array(MainProductEntitySchema).optional()
})

export const ProductEntitySchema = MainProductEntitySchema.merge(SubProductEntitySchema);

// Database Entities
export type ProductEntity = z.infer<typeof ProductEntitySchema>

// Application DTO
// cm: reusing entity schema here since both are exactly the same
export type Product = z.infer<typeof ProductEntitySchema>

export const productConverter = {
    toEntity(dto: Product): ProductEntity {

        const productEntity = {
            id: dto.id ?? new ObjectId().toHexString(),
            name: dto.name,
            code: dto.code,
            price: dto.price,
            currencyCode: dto.currencyCode,
            image: dto.image
        };

        const result = ProductEntitySchema.safeParse(productEntity);
        if (result.success) {
            return result.data;
        } else {
            const zodError = fromZodError(result.error)
            console.log('validation error', JSON.stringify(zodError))
            throw new Error('ProductEntitySchema validation error')
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
        };

        const result = ProductEntitySchema.safeParse(productDTO);
        if (result.success) {
            return result.data;
        } else {
            const zodError = fromZodError(result.error)
            console.log('validation error', JSON.stringify(zodError))
            throw new Error('ProductEntitySchema validation error')
        }
    },
};

