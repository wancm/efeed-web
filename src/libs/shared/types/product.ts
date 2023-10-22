import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { CurrencySchema } from './currency';
import { ImageSchema } from './image';

const MainProductSchema = z.object({
    id: z.string().uuid().default(uuidv4()),
    code: z.string().max(20).min(3).optional(),
    name: z.string().max(100).min(3).optional(),
    price: z.number().default(0),
    currency: CurrencySchema,
    image: ImageSchema
})

const SubProductSchema = z.object({
    products: z.array(MainProductSchema)
})

export const ProductSchema = MainProductSchema.merge(SubProductSchema);

type Product = z.infer<typeof ProductSchema>

export default Product;
