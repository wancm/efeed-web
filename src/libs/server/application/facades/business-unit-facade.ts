import { z } from "zod"
import { BusinessUnit, BusinessUnitDTOSchema } from "@/libs/shared/types/business-unit"
import { ObjectId } from "mongodb"
import { fromZodError } from "zod-validation-error"
import { BusinessUnitsRepository } from "@/libs/server/types/repositories/business-units-repository"
import { factory } from "@/libs/server/factory"
import { testHelper } from "@/libs/shared/utils/test-helper"
import { SessionService } from "@/libs/server/types/services/session-service"
import { appSettings } from "@/libs/appSettings"

const RegisterParamSchema = z.object({
    name: BusinessUnitDTOSchema.shape.name,
    admin: z.object({
        lastName: z.string().optional(),
        email: z.string()
    })
})

type RegisterParam = z.infer<typeof RegisterParamSchema>

export class BusinessUnitFacade {

    constructor(private readonly businessUnitRepository: BusinessUnitsRepository,
                private readonly sessionService: SessionService) {
    }

    async registerAsync(param: RegisterParam): Promise<ObjectId> {

        const result = RegisterParamSchema.safeParse(param)

        if (!result.success) {
            /* c8 ignore start */
            const zodError = fromZodError(result.error)
            console.log("validation error", JSON.stringify(zodError))
            throw new Error("RegisterParamSchema validation error")
            /* c8 ignore end */
        }

        param = result.data
        const newBusinessUnit: BusinessUnit = {
            name: param.name
        }

        return await this.businessUnitRepository
            .saveAsync(newBusinessUnit, appSettings.systemId)
    }
}

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest
    describe("#business-unit-facade.ts", () => {

        const facade = new BusinessUnitFacade(
            factory.buildBusinessUnitRepository(),
            factory.buildSessionService())

        const test1 = ".registerAsync()"
        test(test1, async () => {
            console.time(test1)

            const objectId = await facade.registerAsync({
                name: testHelper.generateRandomString(10),
                admin: {
                    email: testHelper.generateRandomString(10)
                }
            })

            console.timeEnd(test1)
        })
    })
}