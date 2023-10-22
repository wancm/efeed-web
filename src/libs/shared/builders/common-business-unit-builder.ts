import { util } from '@/libs/utils/util';
import { UUID } from 'mongodb';
import BusinessUnit from '../types/business-unit';
import Person, { PersonSchema } from '../types/person';
import Shop, { ShopSchema } from '../types/shop';
import { BusinessUnitBuilder } from './types/builders';

export class CommonBusinessUnitBuilder implements BusinessUnitBuilder {

    private businessUnit: BusinessUnit = {
        name: '',
        shops: []
    }

    load(id: UUID): BusinessUnit {
        // load from database
        return this.businessUnit = {
            name: 'load from database',
            shops: []
        }
    }

    build(name: string): BusinessUnit {
        return this.businessUnit = {
            name,
            shops: []
        }
    }

    addContactPerson = (pContactPerson: Person) => {
        const contactPerson = PersonSchema.parse(pContactPerson);
        if (util.isEmptyArr(this.businessUnit.contactPersons)) {
            this.businessUnit.contactPersons = [];
        }

        this.businessUnit.contactPersons?.push(contactPerson);
    }

    addShop = (pShop: Shop) => {
        const shop = ShopSchema.parse(pShop);
        if (util.isEmptyArr(this.businessUnit.shops)) {
            this.businessUnit.shops = [];
        }

        this.businessUnit.shops?.push(shop);
    }

}