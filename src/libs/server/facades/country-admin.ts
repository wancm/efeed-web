import { cacheService } from "@/libs/shared/cache/memory-cache-service"
import { Country } from "../../shared/types/country"
import { masterDataRepository } from "./../core/repositories/master-data-repository"
import { util } from "@/libs/shared/utils/util"

class CountryAdmin {

    private readonly COUNTRIES_CACHE_KEY = "countries"

    async loadCountriesAsync(): Promise<Country[]> {

        let countries = await cacheService.tryGetAsync<Country[]>(this.COUNTRIES_CACHE_KEY)

        if (!util.isArrEmpty(countries)) {
            return countries
        }

        countries = await masterDataRepository.loadCountriesAsync()

        /* c8 ignore start */
        if (util.isArrEmpty(countries)) {
            countries = await this.refreshCountriesMasterDataAsync()
        }

        if (util.isArrEmpty(countries)) {
            throw new Error("Unable to load Countries data.")
        }
        /* c8 ignore end */

        await cacheService.trySetAsync(this.COUNTRIES_CACHE_KEY, countries, -1)

        return countries
    }

    /**
     * Load countries data from json
     */
    async refreshCountriesMasterDataAsync(): Promise<Country[]> {
        const countryServiceModule = await import("@/libs/server/core/countries/country.service")
        return await countryServiceModule.countryService.refreshCountriesMasterDataAsync()
    }

}

export const countryAdmin = new CountryAdmin()

if (import.meta.vitest) {
    const { describe, expect, test } = import.meta.vitest
    describe("#country-admin.ts", () => {

        const test1 = ".loadCountries()"
        test(test1, async () => {
            console.time(test1)

            const countries = await countryAdmin.loadCountriesAsync()

            const countriesFromCache = await countryAdmin.loadCountriesAsync()

            countries.forEach(country => {
                const exists = countriesFromCache.find(c => c.code.isEqual(country.code))
                expect(exists).toBeTruthy()
            })

            console.timeEnd(test1)
        })
    })
}
