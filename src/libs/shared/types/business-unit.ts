import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { PersonSchema } from './person';
import { ShopSchema } from './shop';

export const BusinessUnitSchema = z.object({
    id: z.string().uuid().default(uuidv4()).optional(),
    name: z.string().max(100).min(3),
    code: z.string().max(20).min(3).optional(),
    contactPersons: z.array(PersonSchema).optional(),
    shops: z.array(ShopSchema)
})

type BusinessUnit = z.infer<typeof BusinessUnitSchema>

export default BusinessUnit


