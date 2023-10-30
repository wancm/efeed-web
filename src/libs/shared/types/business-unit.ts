import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { util } from '../utils/util';
import { mongodbUtil } from './../../core/db/mongodb/mongodb-util';
import { PersonEntitySchema, personConverter } from './person';
import { ProductEntitySchema, productConverter } from './product';

// https://zzdjk6.medium.com/typescript-zod-and-mongodb-a-guide-to-orm-free-data-access-layers-f83f39aabdf3

export const BusinessUnitEntitySchema = z.object({
    _id: z.instanceof(ObjectId),
    name: z.string().max(100).min(3),
    code: z.string().max(20).optional(),
    persons: z.array(PersonEntitySchema).optional(),
    products: z.array(ProductEntitySchema),
    shopIds: z.array(z.instanceof(ObjectId)),
    createdBy: z.string().max(100),
    createdDate: z.date().default(util.utcNow()),
    updatedBy: z.string().max(100).optional(),
    updatedDate: z.date().default(util.utcNow()).optional(),
    _ts: z.number().default(util.timestampUtcNow())
})

// Database Entities
export type BusinessUnitEntity = z.infer<typeof BusinessUnitEntitySchema>

// https://zzdjk6.medium.com/typescript-zod-and-mongodb-a-guide-to-orm-free-data-access-layers-f83f39aabdf3

// Application DTO
export const BusinessUnitDTOSchema = z.object({
    id: z.string().optional(),
    name: z.string().nullish(),
    code: z.string().nullish(),
    persons: BusinessUnitEntitySchema.shape.persons.nullish(),
    products: BusinessUnitEntitySchema.shape.products.nullish(),
    shopIds: z.array(z.string()).optional(),
});

export type BusinessUnit = z.infer<typeof BusinessUnitDTOSchema>;

export const businessUnitConverter = {
    toEntity(dto: BusinessUnit): BusinessUnitEntity {
        const shopIds: ObjectId[] = dto.shopIds && !util.isArrEmpty(dto.shopIds) ?
            dto.shopIds.map(id => new ObjectId(id)) :
            [];

        const businessUnitEntity = {
            _id: mongodbUtil.genId(dto.id),
            name: dto.name,
            code: dto.code,
            persons: dto.persons?.map(p => personConverter.toEntity(p)),
            products: dto.products?.map(p => productConverter.toEntity(p)),
            createdBy: '',
            shopIds
        };

        const result = BusinessUnitEntitySchema.safeParse(businessUnitEntity);
        if (result.success) {
            return result.data;
            /* c8 ignore start */
        } else {
            const zodError = fromZodError(result.error)
            console.log('validation error', JSON.stringify(zodError))
            throw new Error('BusinessUnitEntitySchema validation error')
            /* c8 ignore end */
        }
    },

    toDTO(entity: BusinessUnitEntity): BusinessUnit {
        const businessUnitDTO: BusinessUnit = {
            id: entity._id.toHexString(),
            name: entity.name,
            code: entity.code,
            persons: entity.persons?.map(p => personConverter.toDTO(p)),
            products: entity.products?.map(p => productConverter.toDTO(p)),
            shopIds: entity.shopIds.map(id => id.toHexString())
        };

        const result = BusinessUnitDTOSchema.safeParse(businessUnitDTO);
        if (result.success) {
            return result.data;
            /* c8 ignore start */
        } else {
            const zodError = fromZodError(result.error)
            console.log('validation error', JSON.stringify(zodError))
            throw new Error('BusinessUnitDTOSchema validation error')
            /* c8 ignore end */
        }
    },
};