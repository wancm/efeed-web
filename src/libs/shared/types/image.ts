import { z } from 'zod';

export enum UrlTypes {
    Undefined = 'Undefined',
    Main = 'Main',
    Thumbnail = 'Thumbnail',
    Min = 'Min',
}

const UrlEntitySchema = z.object({
    uri: z.string().max(300),
    type: z.nativeEnum(UrlTypes).default(UrlTypes.Main)
})

export const ImageEntitySchema = z.object({
    alt: z.string().min(1).max(20).optional(),
    urls: z.array(UrlEntitySchema)
})

// Database Entities
export type ImageEntity = z.infer<typeof ImageEntitySchema>
export type UrlEntity = z.infer<typeof UrlEntitySchema>

// Application DTO
// cm: reusing entity schema here since both are exactly the same
// cm: please be noted the name 'Image' is reserved key word for HTML DOM, therefore, ImageDTO here :)
export type ImageDTO = z.infer<typeof ImageEntitySchema>
export type Url = z.infer<typeof UrlEntitySchema>
