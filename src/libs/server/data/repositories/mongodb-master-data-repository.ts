import { Collection, ObjectId } from "mongodb"
import { appMongodb } from "@/libs/server/data/mongodb/mongodb-database"
import { MONGO_DB_CONSTANT } from "@/libs/server/data/mongodb/mongodb_const"
import { Country } from "@/libs/shared/types/country"
import "@/libs/shared/extensions"
import { util } from "@/libs/shared/utils/util"
import { MasterDataRepository } from "@/libs/server/types/repositories/master-data-repository"
import countryByAbbreviation from "country-json/src/country-by-abbreviation.json"
import countryByCallingCode from "country-json/src/country-by-calling-code.json"
import countryByCurrencyCode from "country-json/src/country-by-currency-code.json"
import commonCurrency from "@/libs/server/data/common-currency.json"

export class MongodbMasterDataRepository implements MasterDataRepository {

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
            await this.refreshCountriesMasterDataAsync()
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

    loadCountriesMasterDataFromCountryJs(): Country[] {
        const countries: Country[] = []

        countryByAbbreviation.forEach(country => {
            const countryEntity: Country = {
                code: country.abbreviation,
                name: country.country
            }

            const callingCode = countryByCallingCode.find(c => c.country === country.country)

            if (callingCode) countryEntity.callingCode = callingCode.calling_code

            const currencyCode = countryByCurrencyCode.find(c => c.country === country.country)

            if (currencyCode?.currency_code) {
                const currencyCodeStr = currencyCode.currency_code.trim().toUpperCase()
                if ((commonCurrency as any)[currencyCodeStr]) {
                    const currency = (commonCurrency as any)[currencyCodeStr]
                    countryEntity.currency = {
                        code: currencyCodeStr,
                        minorUnit: currency.decimal_digits,
                        symbol: currency.symbol,
                        name: currency.name,
                        symbolNative: currency.symbol_native,
                        namePlural: currency.name_plural
                    }
                }
            }

            countries.push(countryEntity)
        })

        return countries
    }

    async refreshCountriesMasterDataAsync(forceRefresh: boolean = false): Promise<Country[]> {
        const countries = await this.loadCountriesAsync()

        /* c8 ignore start */
        if (countries.length === 0 || forceRefresh) {
            const loadedCountries = this.loadCountriesMasterDataFromCountryJs()
            await this.saveCountriesAsync(loadedCountries)

            return loadedCountries
        }
        /* c8 ignore end */

        return countries
    }
}

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest

    const masterDataRepository = new MongodbMasterDataRepository()

    beforeEach(async (context) => {
        await masterDataRepository.startupAsync()
    })

    describe("#master-data-repositories.ts", () => {

        const test1 = ".loadCountries()"
        test(test1, async () => {
            console.time(test1)

            const countries = await masterDataRepository.loadCountriesAsync()
            countries.forEach(country => {
                expect(country).not.toBeUndefined()
            })

            console.timeEnd(test1)
        })

        test("refresh countries master data", async (context) => {
            await masterDataRepository.refreshCountriesMasterDataAsync()

            const countries = await masterDataRepository.loadCountriesAsync()

            expect(countries.length).greaterThan(0)
        })

        test("load countries master data from CountryJs", async (context) => {
            const raw = masterDataRepository.loadCountriesMasterDataFromCountryJs()

            const countries = await masterDataRepository.loadCountriesAsync()

            raw.forEach(rawCountry => {
                const found = countries.find(c => c.code.isEqual(rawCountry.code))
                expect(found).not.toBeNull()
            })
        })
    })
}