import { PersonTypes } from "@/libs/shared/types/person"
import { Collection, ObjectId } from "mongodb"
import { appSettings } from "@/libs/appSettings"
import { BusinessUnit, businessUnitConverter, BusinessUnitEntity } from "@/libs/shared/types/business-unit"
import { testHelper } from "@/libs/shared/utils/test-helper"
import { appMongodb } from "../db/mongodb/mongodb-database"
import { MONGO_DB_CONSTANT } from "../db/mongodb/mongodb_const"
import { masterDataRepository } from "./master-data-repository"
import { UrlTypes } from "@/libs/shared/types/image"

class BusinessUnitsRepository {

    private isStartup = false
    private businessUnitCollection: Collection<BusinessUnitEntity>

    constructor() {
        this.businessUnitCollection = appMongodb.db.collection(MONGO_DB_CONSTANT.COLLECTION_BUSINESS_UNITS)
    }

    async startupAsync(): Promise<void> {

        if (this.isStartup) return

        /* c8 ignore start */

        const collections = await appMongodb.db.listCollections().toArray()

        const colIndexFound = collections
            .findIndex(c => c.name.isEqual(MONGO_DB_CONSTANT.COLLECTION_BUSINESS_UNITS))

        if (colIndexFound < 0) {


            // create collection

            // https://mongodb.github.io/node-mongodb-native/3.0/api/Db.html#createCollection
            await appMongodb.db.createCollection(MONGO_DB_CONSTANT.COLLECTION_BUSINESS_UNITS)

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_BUSINESS_UNITS} db collection created`)

            // create indexes

            // identifier_asc
            const indexCreatedResult = await this.businessUnitCollection.createIndex({
                name: 1
            }, { name: "name_asc", unique: true })

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_BUSINESS_UNITS} db collection indexes created: ${indexCreatedResult} `)

            const indexCreatedResult1 = await this.businessUnitCollection.createIndex({
                "persons.email": 1,
            }, { name: "persons[].email_asc", unique: true })

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_BUSINESS_UNITS} db collection indexes created: ${indexCreatedResult1} `)

            const indexCreatedResult2 = await this.businessUnitCollection.createIndex({
                createdDate: -1
            }, { name: "createdDate_desc" })

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_BUSINESS_UNITS} db collection indexes created: ${indexCreatedResult2} `)
        }

        this.isStartup = true

        /* c8 ignore end */
    }

    async loadOneAsync(objId: ObjectId): Promise<BusinessUnit> {
        const query = { _id: objId }

        const doc = await this.businessUnitCollection.findOne(query)
        return businessUnitConverter.toDTO(doc as BusinessUnitEntity)
    }

    async loadManyAsync(objIds: ObjectId[]): Promise<BusinessUnit[]> {
        const query = {
            "_id": { "$in": objIds }
        }

        const cursor = this.businessUnitCollection.find(query)

        const businessUnits: BusinessUnit[] = []
        for await (const doc of cursor) {
            businessUnits.push(businessUnitConverter.toDTO(doc))
        }

        return businessUnits
    }

    async saveAsync(businessUnit: BusinessUnit, createdBy: string): Promise<ObjectId> {
        // convert entity: 5.513ms
        const entity = businessUnitConverter.toEntity(businessUnit)
        entity.createdBy = createdBy

        // doc insert: 546.484ms
        const result = await this.businessUnitCollection.insertOne(entity)

        return result.insertedId
    }

    // https://stackoverflow.com/questions/73683048/find-if-a-value-is-not-present-in-array-of-objects-mongodb
    async findByPersonEmailAsync(email: string): Promise<BusinessUnit[]> {
        const query = { "persons.email": email }

        const cursor = this.businessUnitCollection.find(query)

        const businessUnits: BusinessUnit[] = []
        for await (const doc of cursor) {
            businessUnits.push(businessUnitConverter.toDTO(doc))
        }

        return businessUnits
    }

    async existsByPersonEmailAsync(email: string): Promise<boolean> {
        const query = { "persons.email": email }

        return await this.businessUnitCollection
            .countDocuments(query, { limit: 1, hint: "persons[].email_asc" }) > 0
    }
}

export const businessUnitRepository = new BusinessUnitsRepository()

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest

    beforeEach(async () => {
        await masterDataRepository.startupAsync()
        await businessUnitRepository.startupAsync()
    })

    describe("#Business Unit MongoDb repository save", () => {

        //
        const test1 = ".saveAsync <=> loadOneAsync, loadManyAsync"
        test.concurrent(test1, async () => {
            console.time(test1)

            const countryCode = "MY"

            let countries = await masterDataRepository.loadCountriesAsync()
            const malaysia = countries.find(c => c.code.isEqual(countryCode))

            const mock = async () => {

                return {
                    name: testHelper.generateRandomString(10),
                    persons: [testHelper.mockPerson(malaysia)],
                    products: [{
                        name: testHelper.generateRandomString(15),
                        code: testHelper.generateRandomString(8),
                        price: testHelper.generateRandomNumber(3),
                        currencyCode: malaysia?.currency?.code ?? "XXX",
                        image: {
                            urls: [{
                                uri: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.rainforestcruises.com%2Fguides%2Findia-food&psig=AOvVaw37xL1ysYF81v__sCsTVXDw&ust=1698674642103000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCOj4n6e2m4IDFQAAAAAdAAAAABAE",
                                type: UrlTypes.Main,
                            }]
                        }
                    }],
                    shopIds: ["653e6b472d127ec69b090e3e"]
                }
            }

            const objId = await businessUnitRepository.saveAsync(await mock(), appSettings.systemId)

            const mock2 = await mock()
            mock2.shopIds = []
            const objId2 = await businessUnitRepository.saveAsync(mock2, appSettings.systemId)

            const businessUnit = await businessUnitRepository.loadOneAsync(objId)
            expect(businessUnit.id).equals(objId.toHexString())

            const businessUnits = await businessUnitRepository.loadManyAsync([objId, objId2])
            expect(businessUnits[0].id).equals(objId.toHexString())
            expect(businessUnits[1].id).equals(objId2.toHexString())

            console.timeEnd(test1)
        }, 12000)

        //
        const test2 = ".saveAsync <=> loadOneAsync, loadManyAsync simple"
        test.concurrent(test2, async () => {
            console.time(test2)

            //const countryCode = 'MY';

            //let countries = await masterDataRepository.loadCountriesAsync();
            // const malaysia = countries.find(c => c.code.isEqual(countryCode));

            const counter = 1

            for (let i = 0; i < counter; i++) {
                const counterLbl = `counter: ${i}`
                const counterFindByEmailLbl = `counter find by email: ${i}`
                const counterCountByEmailLbl = `counter count by email: ${i}`

                console.time(counterLbl)

                const email = `${testHelper.generateRandomString(5)}@${testHelper.generateRandomString(3)}.com`
                const mock = async () => {
                    return {
                        name: testHelper.generateRandomString(10),
                        persons: [{
                            lastName: testHelper.generateRandomString(10),
                            type: PersonTypes.Internal,
                            email
                        }]
                    }
                }

                await businessUnitRepository.saveAsync(await mock(), appSettings.systemId)

                console.time(counterFindByEmailLbl)
                const businessUnit = (await businessUnitRepository.findByPersonEmailAsync(email))
                    .find(b => {
                        let found = false
                        if (b.persons) {
                            b.persons.some(person => {
                                if (person.email) {
                                    found = person.email?.isEqual(email)
                                }
                                return found
                            })
                        }
                        return found
                    })
                console.timeEnd(counterFindByEmailLbl)
                expect(businessUnit).not.toBeUndefined()

                console.time(counterCountByEmailLbl)
                const exist = (await businessUnitRepository.existsByPersonEmailAsync(email))
                console.timeEnd(counterCountByEmailLbl)
                expect(exist).toBeTruthy()

                console.timeEnd(counterLbl)
            }

            console.timeEnd(test2)
        }, 120000)
    })
}