import { z } from 'zod';

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

export const PhoneSchema = z.object({
    number: z.number().max(20).min(8),
    countryCodes: z.array(z.number().min(2).max(5)),
    type: z.enum(['Primary', 'Secondary', 'Fax'])
})

export const AddressSchema = z.object({
    line1: z.string().max(100).min(5),
    line2: z.string().max(100).optional(),
    line3: z.string().max(100).optional(),
    state: z.string().max(10).optional(),
    city: z.string().max(100).optional(),
    countryCode: z.string().max(3).optional()
})

export const ContactSchema = z.object({
    addresses: z.array(AddressSchema).optional(),
    phones: z.array(PhoneSchema).optional()
})

type Phone = z.infer<typeof PhoneSchema>
type Address = z.infer<typeof AddressSchema>
type Contact = z.infer<typeof ContactSchema>

export default Contact;
export type { Address, Phone };

