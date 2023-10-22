import { z } from 'zod';


const UrlSchema = z.object({
    uri: z.string().max(200).min(5),
    type: z.enum(['Main', 'Thumbnail', 'Min']).default('Main')
})

export const ImageSchema = z.object({
    alt: z.string().min(1).max(20).optional(),
    urls: z.array(UrlSchema)
})

type AppImage = z.infer<typeof ImageSchema>

export default AppImage;
