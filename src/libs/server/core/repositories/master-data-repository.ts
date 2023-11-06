import { Collection, ObjectId } from "mongodb"
import { appMongodb } from "../db/mongodb/mongodb-database"
import { MONGO_DB_CONSTANT } from "../db/mongodb/mongodb_const"
import { Country } from "@/libs/shared/types/country"
import "../../../shared/extensions"
import { countryService } from "@/libs/server/core/countries/country.service"
import { util } from "@/libs/shared/utils/util"

class MasterDataRepository {

    private isStartup = false

    private readonly COUNTRIES_MASTER_DATA: string = "countries_master_data"
    private masterDataCollection: Collection<any>

    constructor() {
        this.masterDataCollection = appMongodb.db.collection(MONGO_DB_CONSTANT.COLLECTION_MASTER_DATA)
    }

    async startupAsync(): Promise<void> {

        if (this.isStartup) return

        /* c8 ignore start */

        const collections = await appMongodb.db.listCollections().toArray()

        const colIndexFound = collections
            .findIndex(c => c.name.isEqual(MONGO_DB_CONSTANT.COLLECTION_MASTER_DATA))

        if (colIndexFound < 0) {

            // create collection

            // https://mongodb.github.io/node-mongodb-native/3.0/api/Db.html#createCollection
            await appMongodb.db.createCollection(MONGO_DB_CONSTANT.COLLECTION_MASTER_DATA)

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_MASTER_DATA} db collection created`)

            // create indexes

            // identifier_asc
            const indexCreatedResult = await this.masterDataCollection.createIndex({
                identifier: 1
            }, { name: "identifier_asc" })

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_MASTER_DATA} db collection indexes created: ${indexCreatedResult} `)
        }

        const countries = await this.loadCountriesAsync()

        if (util.isArrEmpty(countries)) {
            await countryService.refreshCountriesMasterDataAsync()
        }

        this.isStartup = true

        /* c8 ignore end */
    }

    async loadCountriesAsync(): Promise<Country[]> {
        const query = { identifier: this.COUNTRIES_MASTER_DATA }

        const result = await this.masterDataCollection.findOne(query)

        if (result) {
            return result.countries
        }

        return []
    }

    async saveCountriesAsync(countries: Country[]): Promise<ObjectId> {

        const options = {
            projection: { _id: 0 },
        }
        const query = { identifier: this.COUNTRIES_MASTER_DATA }

        const found = await this.masterDataCollection.findOne(query, options)

        if (found) throw new Error(`${this.COUNTRIES_MASTER_DATA} document existed`)

        const result = await this.masterDataCollection.insertOne({
            identifier: this.COUNTRIES_MASTER_DATA,
            countries
        })

        return result.insertedId
    }
}

export const masterDataRepository = new MasterDataRepository()

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest

    beforeEach(async (context) => {
        await masterDataRepository.startupAsync()
    })

    describe("#master-data-repository.ts", () => {

        const test1 = ".loadCountries()"
        test(test1, async () => {
            console.time(test1)

            const countries = await masterDataRepository.loadCountriesAsync()
            countries.forEach(country => {
                expect(country).not.toBeUndefined()
            })

            console.timeEnd(test1)
        })
    })
}