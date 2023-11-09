import { Collection, ObjectId, SortDirection } from "mongodb"
import { appMongodb } from "@/libs/server/data/mongodb/mongodb-database"
import { MONGO_DB_CONSTANT } from "@/libs/server/data/mongodb/mongodb_const"
import { appSettings } from "@/libs/appSettings"
import "@/libs/shared/extensions"
import { testHelper } from "@/libs/shared/utils/test-helper"
import { MongodbMasterDataRepository } from "./mongodb-master-data-repository"
import { Person, personConverter, PersonEntity, PersonTypes } from "@/libs/shared/types/person"
import { AddressTypes, PhoneTypes } from "@/libs/shared/types/contacts"
import { mongodbUtil } from "@/libs/server/data/mongodb/mongodb-util"
import { util } from "@/libs/shared/utils/util"
import { businessUnitConverter, BusinessUnitEntity } from "@/libs/shared/types/business-unit"
import { PersonRepository } from "@/libs/server/types/repositories/person-repository"
import { MongoDbBusinessUnitsRepository } from "@/libs/server/data/repositories/mongodb-business-units-repository"


type PersonBusinessUnitEntity = PersonEntity & { businessUnit_docs: BusinessUnitEntity[] }

export class MongoDbPersonRepository implements PersonRepository {

    private isStartup = false
    private personCollection: Collection<PersonEntity>

    constructor() {
        this.personCollection = appMongodb.db.collection(MONGO_DB_CONSTANT.COLLECTION_PERSONS)
    }

    async startupAsync(): Promise<void> {

        if (this.isStartup) return

        /* c8 ignore start */

        const collections = await appMongodb.db.listCollections().toArray()

        const colIndexFound = collections
            .findIndex(c => c.name.isEqual(MONGO_DB_CONSTANT.COLLECTION_PERSONS))

        if (colIndexFound < 0) {
            // create collection

            // https://mongodb.github.io/node-mongodb-native/3.0/api/Db.html#createCollection
            await appMongodb.db.createCollection(MONGO_DB_CONSTANT.COLLECTION_PERSONS)

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_PERSONS} db collection created`)

            // create indexes

            const indexCreatedResult = await this.personCollection.createIndex({
                email: 1
            }, { name: "email_unique_asc", unique: true })

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_PERSONS} db collection indexes created: ${indexCreatedResult} `)

            const indexCreatedResult1 = await this.personCollection.createIndex({
                businessUnitId: 1
            }, { name: "businessUnitId_asc" })

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_PERSONS} db collection indexes created: ${indexCreatedResult1} `)

            const indexCreatedResult2 = await this.personCollection.createIndex({
                createdDate: -1
            }, { name: "createdDate_desc" })

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_PERSONS} db collection indexes created: ${indexCreatedResult2} `)

            const indexCreatedResult4 = await this.personCollection.createIndex({
                lastName: "text",
                firstName: "text",
                email: "text",
                "contact.addresses.line1": "text",
                "contact.addresses.line2": "text",
                "contact.addresses.line3": "text",
                "contact.addresses.state": "text",
                "contact.addresses.city": "text",
                "contact.addresses.countryCode": "text",
                "contact.phones.number": "text",
            }, { name: "search_text" })

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_SHOPS} db collection indexes created: ${indexCreatedResult4} `)
        }

        this.isStartup = true

        /* c8 ignore end */
    }

    async loadOneAsync(id: string): Promise<Person> {
        const query = { _id: id.toObjectId() }

        const doc = await this.personCollection.findOne(query)
        return personConverter.toDTO(doc as PersonEntity)
    }

    async loadByBusinessUnitIdAsync(businessUnitId: string): Promise<Person[]> {

        // define an query document
        const query = {
            businessUnitId: businessUnitId.toObjectId()
        }

        // https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/read-operations/sort/
        // sort in descending (-1) order by
        const dir: SortDirection = "asc"
        const sort = { "name": dir }

        const cursor = this.personCollection
            .find(query)
            .sort(sort)

        const persons: Person[] = []
        for await (const doc of cursor) {
            persons.push(personConverter.toDTO(doc))
        }

        return persons
    }

    async saveAsync(person: Person, createdBy: string): Promise<string> {
        const entity = personConverter.toEntity(person, createdBy)

        const result = await this.personCollection.insertOne(entity)

        return result.insertedId.toHexString()
    }

    // https://stackoverflow.com/questions/73683048/find-if-a-value-is-not-present-in-array-of-objects-mongodb
    async findByEmailAsync(email: string): Promise<Person | undefined> {

        const pipeline = [
            { $match: { "email": email } },
            {
                $lookup: {
                    from: MONGO_DB_CONSTANT.COLLECTION_BUSINESS_UNITS,
                    localField: "businessUnitId",
                    foreignField: "_id",
                    as: "businessUnit_docs"
                }
            }
        ]

        const aggCursor = this.personCollection.aggregate<PersonBusinessUnitEntity>(pipeline)

        const persons: Person[] = []
        for await (const doc of aggCursor) {
            const person = personConverter.toDTO(doc)

            if (!util.isArrEmpty(doc.businessUnit_docs)) {
                person.businessUnit = businessUnitConverter.toDTO(doc.businessUnit_docs[0])
            }

            persons.push(person)
        }

        return !util.isArrEmpty(persons) ? persons[0] : undefined
    }

    async existsEmailAsync(email: string): Promise<boolean> {
        const query = { "email": email }

        return await this.personCollection
            .countDocuments(query, { limit: 1 }) > 0
    }

    async findByQueryTextAsync(businessUnitId: string, queryText: string): Promise<Person | undefined> {

        if (queryText?.isNilOrEmpty()) return undefined

        // https://www.mongodb.com/docs/manual/reference/operator/query/text/
        const query = {
            businessUnitId: businessUnitId.toObjectId(),
            $text: {
                $search: queryText
            }
        } as const


        // https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/read-operations/sort/
        // sort in descending (-1) order by
        const dir: SortDirection = "asc"
        const sort = { "name": dir }

        const cursor = this.personCollection
            .find(query)
            .sort(sort)

        const persons: Person[] = []
        for await (const doc of cursor) {
            persons.push(personConverter.toDTO(doc))
        }

        return !util.isArrEmpty(persons) ? persons[0] : undefined
    }
}

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest

    const personRepository = new MongoDbPersonRepository()
    const businessUnitRepository = new MongoDbBusinessUnitsRepository()
    const masterDataRepository = new MongodbMasterDataRepository()

    beforeEach(async (context) => {
        await masterDataRepository.startupAsync()
        await personRepository.startupAsync()
    })

    describe("#person-repositories.ts", () => {

        const test1 = ".saveAsync, loadOneAsync, loadManyAsync"
        test(test1, async () => {
            console.time(test1)

            const countryCode = "MY"
            const businessUnitId = new ObjectId().toHexString()

            const countries = await masterDataRepository.loadCountriesAsync()
            const malaysia = countries.find(c => c.code.isEqual(countryCode))

            const mockPerson = async (): Promise<Person> => {
                return {
                    businessUnitId,
                    email: `${testHelper.generateRandomString(5)}@${testHelper.generateRandomString(3)}.com`,
                    lastName: testHelper.generateRandomString(5),
                    firstName: testHelper.generateRandomString(10),
                    dateOfBirth: "26051982".toDate(),
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
                }
            }

            const objId = await personRepository.saveAsync(await mockPerson(), appSettings.systemId)
            const objId2 = await personRepository.saveAsync(await mockPerson(), appSettings.systemId)

            const persons = await personRepository
                .loadByBusinessUnitIdAsync(businessUnitId)

            expect(persons.filter(p => p.id?.isEqual(objId))).not.toBeNull()
            expect(persons.filter(p => p.id?.isEqual(objId2))).not.toBeNull()

            console.timeEnd(test1)
        }, 120000)

        const test2 = ".saveAsync, .findByEmailAsync, .existsEmailAsync"
        test(test2, async () => {
            console.time(test2)

            const businessUnitId = mongodbUtil.genId().toHexString()

            await businessUnitRepository.saveAsync({
                id: businessUnitId,
                name: testHelper.generateRandomString(10)
            }, appSettings.systemId)

            const email = `${testHelper.generateRandomString(5)}@${testHelper.generateRandomString(3)}.com`

            const mockPerson = async (): Promise<Person> => {
                return {
                    businessUnitId,
                    email,
                    type: PersonTypes.Internal
                }
            }

            const objId = await personRepository.saveAsync(await mockPerson(), appSettings.systemId)

            const exists = await personRepository
                .existsEmailAsync(email)

            const person = await personRepository
                .findByEmailAsync(email)

            expect(exists).toBeTruthy()
            expect(person?.id).toEqual(objId)

            console.timeEnd(test2)
        }, 120000)

        const test3 = ".saveAsync, findByQueryTextAsync"
        test(test3, async () => {
            console.time(test3)

            const countryCode = "MY"
            const businessUnitId = new ObjectId().toHexString()

            const countries = await masterDataRepository.loadCountriesAsync()
            const malaysia = countries.find(c => c.code.isEqual(countryCode))

            const mockPerson = async (): Promise<Person> => {
                return {
                    businessUnitId,
                    email: `${testHelper.generateRandomString(5)}@${testHelper.generateRandomString(3)}.com`,
                    lastName: testHelper.generateRandomString(5),
                    firstName: testHelper.generateRandomString(10),
                    dateOfBirth: "26051982".toDate(),
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
                }
            }

            const counter = 5

            for (let i = 0; i < counter; i++) {
                const person = await mockPerson()

                await personRepository.saveAsync(person, appSettings.systemId)

                const random = testHelper.generateRandomNumber(1)

                let queryType = "lastName"
                let queryText = person.lastName

                /*
                lastName: queryText,
                firstName: queryText,
                email: queryText,
                contact: {
                    addresses:
                        {
                            line1: queryText,
                            line2: queryText,
                            line3: queryText,
                            line4: queryText,
                            state: queryText,
                            city: queryText,
                            countryCode: queryText,
                        },
                    phones: {
                        number: queryText
                    }
                 */
                switch (random) {
                    case 1:
                        queryType = "lastName"
                        queryText = person.lastName
                        break

                    case 2:
                        queryType = "firstName"
                        queryText = person.firstName
                        break

                    case 3:
                        queryType = "email"
                        queryText = person.email
                        break

                    case 4:
                        queryType = "addresses.line1"
                        queryText = person.contact?.addresses?.map(a => a)[0].line1
                        break

                    case 5:
                        queryType = "addresses.line2"
                        queryText = person.contact?.addresses?.map(a => a)[0].line2
                        break

                    case 6:
                        queryType = "addresses.line3"
                        queryText = person.contact?.addresses?.map(a => a)[0].line3
                        break

                    case 7:
                        queryType = "addresses.state"
                        queryText = person.contact?.addresses?.map(a => a)[0].state
                        break

                    case 8:
                        queryType = "addresses.city"
                        queryText = person.contact?.addresses?.map(a => a)[0].city
                        break

                    case 9:
                        queryType = "addresses.countryCode"
                        queryText = person.contact?.addresses?.map(a => a)[0].countryCode
                        break

                    case 0:
                        queryType = "addresses.countryCode"
                        queryText = person.contact?.phones?.map(a => a)[0].number?.toString()
                        break
                }

                const label = `findByQueryTextAsync. ${queryType}: ${queryText}`
                console.time(label)
                const persons = await personRepository
                    .findByQueryTextAsync(businessUnitId, queryText ?? "")
                console.timeEnd(label)
            }

            console.timeEnd(test3)
        }, 120000)
    })
}