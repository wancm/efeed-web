import { Collection, ObjectId, SortDirection } from 'mongodb';
import { appMongodb } from '../db/mongodb/mongodb-database';
import { MONGO_DB_CONSTANT } from '../db/mongodb/mongodb_const';
import { appSettings } from './../../../../libs/appSettings';
import { AddressTypes, PhoneTypes } from './../../../shared/types/contacts';
import { PersonTypes } from './../../../shared/types/person';
import { Shop, ShopEntity, shopConverter } from './../../../shared/types/shop';
import '../../../shared/bootstrap-extensions';
import { testHelper } from '../../../shared/utils/test-helper';
import { masterDataRepository } from './master-data-repository';

class ShopRepository {

    private isStartup = false;
    private shopCollection: Collection<ShopEntity>;

    constructor() {
        this.shopCollection = appMongodb.db.collection(MONGO_DB_CONSTANT.COLLECTION_SHOPS);
    }

    async startupAsync(): Promise<void> {

        if (this.isStartup) return;

        /* c8 ignore start */

        const collections = await appMongodb.db.listCollections().toArray();

        const colIndexFound = collections
            .findIndex(c => c.name.equalCaseIgnored(MONGO_DB_CONSTANT.COLLECTION_SHOPS));

        if (colIndexFound < 0) {
            // create collection

            // https://mongodb.github.io/node-mongodb-native/3.0/api/Db.html#createCollection
            await appMongodb.db.createCollection(MONGO_DB_CONSTANT.COLLECTION_SHOPS)

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_SHOPS} db collection created`);

            // create indexes

            // identifier_asc
            const indexCreatedResult = await this.shopCollection.createIndex({
                businessUnitId: 1
            }, { name: 'businessUnitId_asc' })

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_SHOPS} db collection indexes created: ${indexCreatedResult} `);

            const indexCreatedResult2 = await this.shopCollection.createIndex({
                name: 1
            }, { name: 'name_asc' })

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_SHOPS} db collection indexes created: ${indexCreatedResult2} `);

            const indexCreatedResult3 = await this.shopCollection.createIndex({
                createdDate: -1
            }, { name: 'createdDate_desc' })

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_SHOPS} db collection indexes created: ${indexCreatedResult3} `);
        }

        this.isStartup = true;

        /* c8 ignore end */
    }

    async loadOneAsync(objId: ObjectId): Promise<Shop> {
        const query = { _id: objId };

        const doc = await this.shopCollection.findOne(query);
        return shopConverter.toDTO(doc as ShopEntity);
    }

    async loadByBusinessUnitIdAsync(businessUnitId: ObjectId): Promise<Shop[]> {

        // define an query document
        const query = {
            businessUnitId
        }

        // https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/read-operations/sort/
        // sort in descending (-1) order by 
        const dir: SortDirection = 'asc';
        const sort = { 'name': dir }

        const cursor = this.shopCollection
            .find(query)
            .sort(sort)

        const shops: Shop[] = [];
        for await (const doc of cursor) {
            shops.push(shopConverter.toDTO(doc))
        }

        return shops
    }

    async saveAsync(shop: Shop, createdBy: string): Promise<ObjectId> {
        // convert entity: 5.513ms
        const entity = shopConverter.toEntity(shop);
        entity.createdBy = createdBy;

        // doc insert: 546.484ms
        const result = await this.shopCollection.insertOne(entity);

        return result.insertedId;
    }
}

export const shopRepository = new ShopRepository();

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest;

    beforeEach(async (context) => {
        await masterDataRepository.startupAsync();
        await shopRepository.startupAsync();
    })

    describe("#shop-repository.ts", () => {

        const test1 = '.saveAsync <=> loadOneAsync, loadManyAsync';
        test.concurrent(test1, async () => {
            console.time(test1);

            const countryCode = 'MY';
            const businessUnitId = new ObjectId().toHexString();

            const countries = await masterDataRepository.loadCountriesAsync();
            const malaysia = countries.find(c => c.code.equalCaseIgnored(countryCode));

            const mock = async () => {
                return {
                    name: testHelper.generateRandomString(10),
                    businessUnitId,
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
                    }]
                }
            };

            const objId = await shopRepository.saveAsync(await mock(), appSettings.systemId);

            const objId2 = await shopRepository.saveAsync(await mock(), appSettings.systemId);

            const shop = await shopRepository.loadOneAsync(objId);

            const shops = await shopRepository
                .loadByBusinessUnitIdAsync(new ObjectId(businessUnitId));

            expect(shop.id).equals(objId.toHexString());
            expect(shops.filter(s => s.id?.equalCaseIgnored(objId.toHexString()))).not.toBeNull();
            expect(shops.filter(s => s.id?.equalCaseIgnored(objId2.toHexString()))).not.toBeNull();

            console.timeEnd(test1);
        }, 120000)
    })
}


