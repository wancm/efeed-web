import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { ContactEntitySchema, contactConverter } from './contacts';

export enum PersonTypes {
    Undefined = 'Undefined',
    Internal = 'Internal',
    Member = 'Member',
    Guest = 'Guest',
}

export const PersonEntitySchema = z.object({
    id: z.string().optional(),
    lastName: z.string().min(1).max(100),
    firstName: z.string().max(100).optional(),
    dateOfBirth: z.string().min(8).optional(),
    email: z.string().min(3).max(200),
    contact: ContactEntitySchema.optional(),
    type: z.nativeEnum(PersonTypes),
})

// Database Entities
export type PersonEntity = z.infer<typeof PersonEntitySchema>

// Application DTO
// cm: reusing entity schema here since both are exactly the same
export type Person = z.infer<typeof PersonEntitySchema>

export const personConverter = {
    toEntity(dto: Person): PersonEntity {
        const personEntity = {
            id: dto.id ?? new ObjectId().toHexString(),
            lastName: dto.lastName,
            firstName: dto.firstName,
            dateOfBirth: dto.dateOfBirth,
            email: dto.email,
            contact: dto.contact ? contactConverter.toEntity(dto.contact) : undefined,
            type: dto.type
        };

        const result = PersonEntitySchema.safeParse(personEntity);
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

    toDTO(entity: PersonEntity): Person {

        const personDTO: Person = {
            id: entity.id,
            lastName: entity.lastName,
            firstName: entity.firstName,
            dateOfBirth: entity.dateOfBirth,
            email: entity.email,
            contact: entity.contact ? contactConverter.toDTO(entity.contact) : undefined,
            type: entity.type
        };

        const result = PersonEntitySchema.safeParse(personDTO);
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