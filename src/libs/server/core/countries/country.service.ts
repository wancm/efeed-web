import countryByAbbreviation from "country-json/src/country-by-abbreviation.json"
import countryByCallingCode from "country-json/src/country-by-calling-code.json"
import countryByCurrencyCode from "country-json/src/country-by-currency-code.json"
import { masterDataRepository } from "../repositories/master-data-repository"
import { Country } from "@/libs/shared/types/country"
import commonCurrency from "./../../data/common-currency.json"

class CountryService {
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
        const countries = await masterDataRepository.loadCountriesAsync()

        /* c8 ignore start */
        if (countries.length === 0 || forceRefresh) {
            const loadedCountries = countryService.loadCountriesMasterDataFromCountryJs()
            await masterDataRepository.saveCountriesAsync(loadedCountries)

            return loadedCountries
        }
        /* c8 ignore end */

        return countries
    }
}

export const countryService = new CountryService()

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest

    describe("country-service.ts #loadCountriesMasterDataFromCountryJs", () => {

        beforeEach(async (context) => {
            await masterDataRepository.startupAsync()
        })

        test("refresh countries master data", async (context) => {
            await countryService.refreshCountriesMasterDataAsync()

            const countries = await masterDataRepository.loadCountriesAsync()

            expect(countries.length).greaterThan(0)
        })

        test("load countries master data from CountryJs", async (context) => {
            const raw = countryService.loadCountriesMasterDataFromCountryJs()

            const countries = await masterDataRepository.loadCountriesAsync()

            raw.forEach(rawCountry => {
                const found = countries.find(c => c.code.isEqual(rawCountry.code))
                expect(found).not.toBeNull()
            })
        })
    })
}