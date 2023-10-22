import { UUID } from 'mongodb';
import BusinessUnit from "../../types/business-unit";

class BusinessUnitRepositoryMongoDb {
    load(id: UUID): BusinessUnit {
        return {
            name: 'dummy',
            shops: []
        }
    }

    save(businessUnit: BusinessUnit): UUID {

    }
}

export const businessUnitRepositoryMongoDb = new BusinessUnitRepositoryMongoDb();