import { z } from "zod"
import { fromZodError } from "zod-validation-error"

export enum UrlTypes {
    Undefined = "Undefined",
    Main = "Main",
    Thumbnail = "Thumbnail",
    Min = "Min",
}

export const UrlEntitySchema = z.object({
    uri: z.string().max(300),
    type: z.nativeEnum(UrlTypes).default(UrlTypes.Main)
})

export const AppImageEntitySchema = z.object({
    alt: z.string().min(1).max(20).nullish(),
    urls: z.array(UrlEntitySchema)
})

// Database Entities
export type AppImageEntity = z.infer<typeof AppImageEntitySchema>


export const UrlDtoSchema = z.object({
    uri: z.string().nullish(),
    type: z.nativeEnum(UrlTypes).optional()
})

export const AppImageDtoSchema = z.object({
    alt: z.string().nullish(),
    urls: z.array(UrlDtoSchema).optional()
})

// Application DTO
export type AppImage = z.infer<typeof AppImageDtoSchema>

export const imageConverter = {
    toEntity(dto: AppImage): AppImageEntity {

        const entity = {
            alt: dto.alt,
            urls: dto.urls
        }

        const result = AppImageEntitySchema.safeParse(entity)

        if (result.success) {
            return result.data
            /* c8 ignore start */
        } else {
            const zodError = fromZodError(result.error)
            console.log("validation error", JSON.stringify(zodError))
            throw new Error("AppImageEntitySchema validation error")
            /* c8 ignore end */
        }
    },

    toDTO(entity: AppImageEntity): AppImage {

        const dto: AppImage = {
            alt: entity.alt,
            urls: entity.urls
        }

        const result = AppImageDtoSchema.safeParse(dto)

        if (result.success) {
            return result.data
            /* c8 ignore start */
        } else {
            const zodError = fromZodError(result.error)
            console.log("validation error", JSON.stringify(zodError))
            throw new Error("AppImageDtoSchema validation error")
            /* c8 ignore end */
        }
    },
}
