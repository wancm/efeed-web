import { BusinessUnit } from "../../shared/types/business-unit";
import { businessUnitRepository } from "../core/repositories/business-units-repository";
import { appSettings } from "@/libs/appSettings";
import { CommonBusinessUnitBuilder } from "./common-business-unit-builder";

class BusinessUnitDirector {

    private commonBusinessUnitBuilder = new CommonBusinessUnitBuilder();

    async createBusinessUnit(name: string): Promise<BusinessUnit> {
        const businessUnit = this
            .commonBusinessUnitBuilder
            .build(name);

        const objId = await businessUnitRepository.saveAsync(businessUnit, appSettings.systemId);

        return businessUnit;
    }
}

export const businessUnitDirector = new BusinessUnitDirector();