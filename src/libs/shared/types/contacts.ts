import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

export enum PhoneTypes {
    Undefined = 'Undefined',
    Primary = 'Primary',
    Secondary = 'Secondary',
    Fax = 'Fax'
}

export enum AddressTypes {
    Undefined = 'Undefined',
    Primary = 'Primary',
    Home = 'Home',
    Office = 'Office',
}

export const PhoneEntitySchema = z.object({
    id: z.string().optional(),
    number: z.number(),
    countryCodeNumber: z.number(),
    type: z.nativeEnum(PhoneTypes).optional().default(PhoneTypes.Primary),
})

export const AddressEntitySchema = z.object({
    id: z.string().optional(),
    line1: z.string().max(100).min(5),
    line2: z.string().max(100).optional(),
    line3: z.string().max(100).optional(),
    state: z.string().max(10).optional(),
    city: z.string().max(100).optional(),
    countryCode: z.string().max(2).optional(),
    type: z.nativeEnum(AddressTypes).optional().default(AddressTypes.Primary),
})

export const ContactEntitySchema = z.object({
    id: z.string().optional(),
    addresses: z.array(AddressEntitySchema).optional(),
    phones: z.array(PhoneEntitySchema).optional()
})

// Database Entities
export type PhoneEntity = z.infer<typeof PhoneEntitySchema>
export type AddressEntity = z.infer<typeof AddressEntitySchema>
export type ContactEntity = z.infer<typeof ContactEntitySchema>

// Application DTO
// cm: reusing entity schema here since both are exactly the same
export type Phone = z.infer<typeof PhoneEntitySchema>
export type Address = z.infer<typeof AddressEntitySchema>
export type Contact = z.infer<typeof ContactEntitySchema>

export const contactConverter = {
    toEntity(dto: Contact): ContactEntity {

        const contactEntity = {
            id: dto.id ?? new ObjectId().toHexString(),
            addresses: dto.addresses?.map(a => {
                try {
                    a.id = a.id ?? new ObjectId().toHexString()
                    return AddressEntitySchema.parse(a)
                }
                catch (err) {
                    console.log(err);
                }

            }),
            phones: dto.phones?.map(p => {
                p.id = p.id ?? new ObjectId().toHexString()
                return PhoneEntitySchema.parse(p)
            })
        };

        const result = ContactEntitySchema.safeParse(contactEntity);
        if (result.success) {
            return result.data;
        } else {
            const zodError = fromZodError(result.error)
            console.log('validation error', JSON.stringify(zodError))
            throw new Error('ShopEntitySchema validation error')
        }
    },

    toDTO(entity: ContactEntity): Contact {

        const contactDTO: Contact = {
            addresses: entity.addresses,
            phones: entity.phones,
        };

        const result = ContactEntitySchema.safeParse(contactDTO);
        if (result.success) {
            return result.data;
        } else {
            const zodError = fromZodError(result.error)
            console.log('validation error', JSON.stringify(zodError))
            throw new Error('ShopDTOSchema validation error')
        }
    },
};


/** https://gist.github.com/ciiqr/ee19e9ff3bb603f8c42b00f5ad8c551e
    // zod schema
    z.object({
        // valid if string or:
        optional: z.string().optional(), // field not provided, or explicitly `undefined`
        nullable: z.string().nullable(), // field explicitly `null`
        nullish: z.string().nullish(), // field not provided, explicitly `null`, or explicitly `undefined`
    });

    // type
    {
        optional?: string | undefined;
        nullable: string | null;
        nullish?: string | null | undefined;
    }
 */