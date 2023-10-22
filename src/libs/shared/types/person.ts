import { z } from 'zod';
import { ContactSchema } from './contacts';

export const PersonSchema = z.object({
    lastName: z.string().min(1).max(100),
    firstName: z.string().max(100).optional(),
    /**
     * YYYYMMDD
     */
    dateOfBirth: z.string().min(8).optional(),
    email: z.string().min(3).max(200),
    contact: ContactSchema,
    type: z.enum(['BusinessUnitManager', 'ShopManager', 'Guest'])
})

type Person = z.infer<typeof PersonSchema>

export default Person;
