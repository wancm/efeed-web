import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { PersonSchema } from './person';
import { ProductSchema } from './product';

export const ShopSchema = z.object({
    id: z.string().uuid().default(uuidv4()),
    code: z.string().max(20).min(3),
    name: z.string().max(100).min(3),
    contactPersons: z.array(PersonSchema),
    products: z.array(ProductSchema)
})

type Shop = z.infer<typeof ShopSchema>

export default Shop;
