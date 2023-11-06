import { z } from "zod"

export const CurrencyEntitySchema = z.object({
    code: z.string().min(2).max(3),
    minorUnit: z.union([z.literal(2), z.literal(3)]).default(2),
    symbol: z.string().optional(),
    name: z.string().optional(),
    symbolNative: z.string().optional(),
    rounding: z.string().optional(),
    namePlural: z.string().optional()
})

export const CountryEntitySchema = z.object({
    code: z.string().min(2),
    name: z.string().max(200),
    currency: CurrencyEntitySchema.optional(),
    callingCode: z.number().optional()
})

// // Database Entities
// export type CurrencyEntity = z.infer<typeof CurrencyEntitySchema>
// export type CountryEntity = z.infer<typeof CountryEntitySchema>

export const CurrencyDtoSchema = z.object({
    code: z.string(),
    minorUnit: CurrencyEntitySchema.shape.minorUnit,
    symbol: z.string().nullish(),
    name: z.string().nullish(),
    symbolNative: z.string().nullish(),
    rounding: z.string().nullish(),
    namePlural: z.string().nullish()
})

export const CountryDtoSchema = z.object({
    code: z.string(),
    name: z.string().nullish(),
    currency: CurrencyDtoSchema.nullish(),
    callingCode: z.number().nullish()
})

// Application DTO
// cm: reusing entity schema here since both are exactly the same
export type Currency = z.infer<typeof CurrencyDtoSchema>
export type Country = z.infer<typeof CountryDtoSchema>