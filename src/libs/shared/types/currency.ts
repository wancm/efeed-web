import { z } from 'zod';

export const CurrencySchema = z.object({
    code: z.string().max(3).min(3),
    minorUnit: z.union([z.literal(2), z.literal(3)]).default(2)
})

type Currency = z.infer<typeof CurrencySchema>

export default Currency;
