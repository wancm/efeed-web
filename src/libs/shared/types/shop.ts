import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { util } from '../utils/util';
import { mongodbUtil } from './../../server/core/db/mongodb/mongodb-util';
import { PersonEntitySchema, personConverter } from './person';

export const ShopEntitySchema = z.object({
    _id: z.instanceof(ObjectId),
    businessUnitId: z.instanceof(ObjectId),
    name: z.string().max(100).min(3),
    code: z.string().max(20).optional(),
    persons: z.array(PersonEntitySchema).optional(),
    productIds: z.array(z.string()),
    createdBy: z.string().max(100),
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
    businessUnitId: z.string().optional(),
    name: z.string().nullish(),
    code: z.string().nullish(),
    persons: ShopEntitySchema.shape.persons.nullish(),
    productIds: z.array(z.string()).optional(),
});

export type Shop = z.infer<typeof ShopDTOSchema>;

export const shopConverter = {
    toEntity(dto: Shop): ShopEntity {
        const productIds = dto.productIds ?? [];
        const shopEntity = {
            _id: mongodbUtil.genId(dto.id),
            businessUnitId: new ObjectId(dto.businessUnitId),
            name: dto.name,
            code: dto.code,
            persons: dto.persons?.map(p => personConverter.toEntity(p)),
            createdBy: '',
            productIds
        };

        const result = ShopEntitySchema.safeParse(shopEntity);
        if (result.success) {
            return result.data;
            /* c8 ignore start */
        } else {
            const zodError = fromZodError(result.error)
            console.log('validation error', JSON.stringify(zodError))
            throw new Error('ShopEntitySchema validation error')
            /* c8 ignore end */
        }
    },

    toDTO(entity: ShopEntity): Shop {

        const shopDTO: Shop = {
            id: entity._id.toHexString(),
            businessUnitId: entity.businessUnitId.toHexString(),
            name: entity.name,
            code: entity.code,
            persons: entity.persons?.map(p => personConverter.toDTO(p)),
            productIds: entity.productIds
        };

        const result = ShopDTOSchema.safeParse(shopDTO);
        if (result.success) {
            return result.data;
            /* c8 ignore start */
        } else {
            const zodError = fromZodError(result.error)
            console.log('validation error', JSON.stringify(zodError))
            throw new Error('ShopDTOSchema validation error')
            /* c8 ignore end */
        }
    },
};
