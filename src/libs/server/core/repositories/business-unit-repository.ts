import { Collection, ObjectId } from 'mongodb';
import { appMongodb } from '../db/mongodb/mongodb-database';
import { MONGO_DB_CONSTANT } from '../db/mongodb/mongodb_const';
import { appSettings } from './../../../appSettings';
import { BusinessUnit, BusinessUnitEntity, businessUnitConverter } from './../../../shared/types/business-unit';
import { AddressTypes, PhoneTypes } from './../../../shared/types/contacts';
import { UrlTypes } from './../../../shared/types/image';
import { PersonTypes } from './../../../shared/types/person';
import { testHelper } from '../../../shared/utils/test-helper';
import { masterDataRepository } from './master-data-repository';

class BusinessUnitRepository {

    private isStartup = false;
    private businessUnitCollection: Collection<BusinessUnitEntity>;

    constructor() {
        this.businessUnitCollection = appMongodb.db.collection(MONGO_DB_CONSTANT.COLLECTION_BUSINESS_UNITS);
    }

    async startupAsync(): Promise<void> {

        if (this.isStartup) return;

        /* c8 ignore start */

        const collections = await appMongodb.db.listCollections().toArray();

        const colIndexFound = collections
            .findIndex(c => c.name.equalCaseIgnored(MONGO_DB_CONSTANT.COLLECTION_BUSINESS_UNITS));

        if (colIndexFound < 0) {


            // create collection

            // https://mongodb.github.io/node-mongodb-native/3.0/api/Db.html#createCollection
            await appMongodb.db.createCollection(MONGO_DB_CONSTANT.COLLECTION_BUSINESS_UNITS)

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_BUSINESS_UNITS} db collection created`);

            // create indexes

            // identifier_asc
            const indexCreatedResult = await this.businessUnitCollection.createIndex({
                name: 1
            }, { name: 'name_asc' })

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_BUSINESS_UNITS} db collection indexes created: ${indexCreatedResult} `);

            const indexCreatedResult2 = await this.businessUnitCollection.createIndex({
                createdDate: -1
            }, { name: 'createdDate_desc' })

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_BUSINESS_UNITS} db collection indexes created: ${indexCreatedResult2} `);
        }

        this.isStartup = true;

        /* c8 ignore end */
    }

    async loadOneAsync(objId: ObjectId): Promise<BusinessUnit> {
        const query = { _id: objId };

        const doc = await this.businessUnitCollection.findOne(query);
        return businessUnitConverter.toDTO(doc as BusinessUnitEntity);
    }


    async loadManyAsync(objIds: ObjectId[]): Promise<BusinessUnit[]> {
        const query = {
            "_id": { "$in": objIds }
        };

        const cursor = await this.businessUnitCollection.find(query);

        const businessUnits: BusinessUnit[] = [];
        for await (const doc of cursor) {
            businessUnits.push(businessUnitConverter.toDTO(doc));
        }

        return businessUnits;
    }

    async saveAsync(businessUnit: BusinessUnit, createdBy: string): Promise<ObjectId> {
        // convert entity: 5.513ms
        const entity = businessUnitConverter.toEntity(businessUnit);
        entity.createdBy = createdBy;

        // doc insert: 546.484ms
        const result = await this.businessUnitCollection.insertOne(entity);

        return result.insertedId;
    }
}

export const businessUnitRepository = new BusinessUnitRepository();

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest;

    beforeEach(async (context) => {
        await masterDataRepository.startupAsync();
        await businessUnitRepository.startupAsync();
    })

    describe("#Business Unit MongoDb repository save", () => {
        const test1 = '.saveAsync <=> loadOneAsync, loadManyAsync';


        test.concurrent(test1, async () => {
            console.time(test1);

            const countryCode = 'MY';

            let countries = await masterDataRepository.loadCountriesAsync();
            const malaysia = countries.find(c => c.code.equalCaseIgnored(countryCode));

            const mock = async () => {

                return {
                    name: testHelper.generateRandomString(10),
                    persons: [{
                        lastName: testHelper.generateRandomString(5),
                        firstName: testHelper.generateRandomString(10),
                        dateOfBirth: '26051982',
                        email: 'unittest@test.com',
                        contact: {
                            addresses: [{
                                line1: testHelper.generateRandomString(15),
                                line2: testHelper.generateRandomString(15),
                                line3: testHelper.generateRandomString(15),
                                state: testHelper.generateRandomString(8),
                                city: testHelper.generateRandomString(15),
                                countryCode: malaysia?.code,
                                type: AddressTypes.Primary
                            }],
                            phones: [{
                                number: testHelper.generateRandomNumber(10),
                                countryCodeNumber: malaysia?.callingCode ?? 0,
                                type: PhoneTypes.Primary
                            }]
                        },
                        type: PersonTypes.Internal
                    }],
                    products: [{
                        name: testHelper.generateRandomString(15),
                        code: testHelper.generateRandomString(8),
                        price: testHelper.generateRandomNumber(3),
                        currencyCode: malaysia?.currency?.code ?? 'XXX',
                        image: {
                            urls: [{
                                uri: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.rainforestcruises.com%2Fguides%2Findia-food&psig=AOvVaw37xL1ysYF81v__sCsTVXDw&ust=1698674642103000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCOj4n6e2m4IDFQAAAAAdAAAAABAE',
                                type: UrlTypes.Main,
                            }]
                        }
                    }],
                    shopIds: ['653e6b472d127ec69b090e3e']
                }
            }

            const objId = await businessUnitRepository.saveAsync(await mock(), appSettings.systemId);

            const mock2 = await mock();
            mock2.shopIds = [];
            const objId2 = await businessUnitRepository.saveAsync(mock2, appSettings.systemId);

            const businessUnit = await businessUnitRepository.loadOneAsync(objId);

            expect(businessUnit.id).equals(objId.toHexString());

            console.timeEnd(test1);
        }, 12000)
    })
}