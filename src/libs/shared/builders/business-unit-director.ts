import BusinessUnit from "../types/business-unit";
import { CommonBusinessUnitBuilder } from "./common-business-unit-builder";

class BusinessUnitDirector {

    private commonBusinessUnitBuilder = new CommonBusinessUnitBuilder();

    createBusinessUnit(name: string): BusinessUnit {
        const businessUnit = this
            .commonBusinessUnitBuilder
            .build(name);

        return businessUnit;
    }
}