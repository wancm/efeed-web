import { z } from 'zod';
import { PersonTypes } from "@/libs/shared/types/person";
import { BusinessUnit, BusinessUnitDTOSchema } from "@/libs/shared/types/business-unit";
import { businessUnitRepository } from "@/libs/server/core/repositories/business-units-repository";
import { fromZodError } from "zod-validation-error";
import { appSettings } from "@/libs/appSettings";
import { testHelper } from "@/libs/shared/utils/test-helper";


const RegisterParamSchema = z.object({
    name: BusinessUnitDTOSchema.shape.name,
    admin: z.object({
        lastName: z.string(),
        email: z.string()
    })
});

type RegisterParam = z.infer<typeof RegisterParamSchema>

class BusinessUnitAdmin {
    //
    async registerAsync(param: RegisterParam) {

        const result = RegisterParamSchema.safeParse(param);

        if (!result.success) {
            /* c8 ignore start */
            const zodError = fromZodError(result.error)
            console.log('validation error', JSON.stringify(zodError))
            throw new Error('RegisterParamSchema validation error')
            /* c8 ignore end */
        }

        param = result.data;
        const newBusinessUnit: BusinessUnit = {
            name: param.name,
            persons: [{
                lastName: param.admin.lastName,
                email: param.admin.email,
                type: PersonTypes.Internal
            }]
        }

        const objId = await businessUnitRepository
            .saveAsync(newBusinessUnit, appSettings.systemId);
    }
}

export const businessUnitAdmin = new BusinessUnitAdmin();

if (import.meta.vitest) {
    const { describe, expect, test } = import.meta.vitest;
    describe("#shop-repository.ts", () => {

        const test1 = '.registerAsync()';
        test(test1, async () => {
            console.time(test1);

            const objId = await businessUnitAdmin.registerAsync({
                name: testHelper.generateRandomString(10),
                admin: {
                    lastName: testHelper.generateRandomString(5),
                    email: testHelper.generateRandomString(10)
                }
            })

            console.timeEnd(test1);
        })
    })
}