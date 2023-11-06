import { ObjectId } from "mongodb"

import { BusinessUnit } from "../../../shared/types/business-unit"
import { Person } from "../../../shared/types/person"
import { BusinessUnitBuilder } from "@/libs/server/logic/types/builders"

export class CommonBusinessUnitBuilder implements BusinessUnitBuilder {

    private businessUnit?: BusinessUnit

    load(id: ObjectId): BusinessUnit {
        // load from database
        return {}
    }

    build(name: string): BusinessUnit {
        return this.businessUnit ?? {}
    }

    addPerson = (person: Person) => {

    }

}