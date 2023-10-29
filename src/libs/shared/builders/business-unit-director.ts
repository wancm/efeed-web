import { businessUnitRepository } from "../../core/repositories/business-unit-repository";
import BusinessUnit from "../types/business-unit";
import { CommonBusinessUnitBuilder } from "./common-business-unit-builder";

class BusinessUnitDirector {

    private commonBusinessUnitBuilder = new CommonBusinessUnitBuilder();

    async createBusinessUnit(name: string): Promise<BusinessUnit> {
        const businessUnit = this
            .commonBusinessUnitBuilder
            .build(name);

        const objId = businessUnitRepository.save(businessUnit);

        return businessUnit;
    }
}

export const businessUnitDirector = new BusinessUnitDirector();