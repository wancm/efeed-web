import { z } from "zod"

export enum UrlTypes {
    Undefined = "Undefined",
    Main = "Main",
    Thumbnail = "Thumbnail",
    Min = "Min",
}

const UrlEntitySchema = z.object({
    uri: z.string().max(300),
    type: z.nativeEnum(UrlTypes).default(UrlTypes.Main)
})

export const ImageEntitySchema = z.object({
    alt: z.string().min(1).max(20).nullish(),
    urls: z.array(UrlEntitySchema)
})

// Database Entities
export type ImageEntity = z.infer<typeof ImageEntitySchema>
export type UrlEntity = z.infer<typeof UrlEntitySchema>


const UrlDtoSchema = z.object({
    uri: z.string().nullish(),
    type: z.nativeEnum(UrlTypes).optional()
})

export const ImageDtoSchema = z.object({
    alt: z.string().nullish(),
    urls: z.array(UrlEntitySchema).optional()
})

// Application DTO
export type ImageDTO = z.infer<typeof ImageDtoSchema>
export type Url = z.infer<typeof UrlDtoSchema>
