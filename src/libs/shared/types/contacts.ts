import { ObjectId } from "mongodb"
import { z } from "zod"
import { fromZodError } from "zod-validation-error"

export enum PhoneTypes {
    Undefined = "Undefined",
    Primary = "Primary",
    Secondary = "Secondary",
    Fax = "Fax"
}

export enum AddressTypes {
    Undefined = "Undefined",
    Primary = "Primary",
    Home = "Home",
    Office = "Office",
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

export const PhoneDtoSchema = z.object({
    id: z.string().nullish(),
    number: z.number().nullish(),
    countryCodeNumber: z.number().nullish(),
    type: z.nativeEnum(PhoneTypes).optional(),
})

export const AddressDtoSchema = z.object({
    id: z.string().nullish(),
    line1: z.string().nullish(),
    line2: z.string().nullish(),
    line3: z.string().nullish(),
    state: z.string().nullish(),
    city: z.string().nullish(),
    countryCode: z.string().nullish(),
    type: z.nativeEnum(AddressTypes).optional(),
})

export const ContactDtoSchema = z.object({
    id: z.string().nullish(),
    addresses: z.array(AddressDtoSchema).nullish(),
    phones: z.array(PhoneDtoSchema).nullish()
})

// Application DTO
export type Phone = z.infer<typeof PhoneDtoSchema>
export type Address = z.infer<typeof AddressDtoSchema>
export type Contact = z.infer<typeof ContactDtoSchema>

export const contactConverter = {
    toEntity(dto: Contact): ContactEntity {

        const contactEntity = {
            id: dto.id ?? new ObjectId().toHexString(),
            addresses: dto.addresses?.map(a => {
                a.id = a.id ?? new ObjectId().toHexString()
                return AddressEntitySchema.parse(a)
            }),
            phones: dto.phones?.map(p => {
                p.id = p.id ?? new ObjectId().toHexString()
                return PhoneEntitySchema.parse(p)
            })
        }

        const result = ContactEntitySchema.safeParse(contactEntity)
        if (result.success) {
            return result.data
            /* c8 ignore start */
        } else {
            const zodError = fromZodError(result.error)
            console.log("validation error", JSON.stringify(zodError))
            throw new Error("ContactEntitySchema validation error")
            /* c8 ignore end */
        }
    },

    toDTO(entity: ContactEntity): Contact {

        const contactDTO: Contact = {
            addresses: entity.addresses ? entity.addresses.map(entity => {
                return {
                    id: entity.id,
                    line1: entity.line1,
                    line2: entity.line2,
                    line3: entity.line3,
                    state: entity.state,
                    city: entity.city,
                    countryCode: entity.countryCode,
                    type: entity.type,
                }
            }) : [],
            phones: entity.phones ? entity.phones.map(entity => {
                return {
                    id: entity.id,
                    number: entity.number,
                    countryCodeNumber: entity.countryCodeNumber,
                    type: entity.type,
                }
            }) : [],
        }

        const result = ContactDtoSchema.safeParse(contactDTO)
        if (result.success) {
            return result.data
            /* c8 ignore start */
        } else {
            const zodError = fromZodError(result.error)
            console.log("validation error", JSON.stringify(zodError))
            throw new Error("ContactDTOSchema validation error")
            /* c8 ignore end */
        }
    },
}


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