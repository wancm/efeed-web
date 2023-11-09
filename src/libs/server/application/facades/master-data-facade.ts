import { util } from "@/libs/shared/utils/util"
import { Country } from "@/libs/shared/types/country"
import { MasterDataRepository } from "@/libs/server/types/repositories/master-data-repository"
import { CacheService } from "@/libs/server/types/services/cache-service"
import { MongodbMasterDataRepository } from "@/libs/server/data/repositories/mongodb-master-data-repository"
import { MemoryCacheService } from "@/libs/shared/cache/memory-cache-service"
import { factory } from "@/libs/server/factory"

class MasterDataFacade {

    private readonly COUNTRIES_CACHE_KEY = "countries"

    constructor(private readonly masterDataRepository: MasterDataRepository,
                private readonly cacheService: CacheService) {
    }

    async loadCountriesAsync(): Promise<Country[]> {

        let countries = await this.cacheService.tryGetAsync<Country[]>(this.COUNTRIES_CACHE_KEY)

        if (!util.isArrEmpty(countries)) {
            return countries
        }

        countries = await this.masterDataRepository.loadCountriesAsync()

        await this.cacheService.trySetAsync(this.COUNTRIES_CACHE_KEY, countries, -1)

        return countries
    }
}

if (import.meta.vitest) {
    const { describe, expect, test } = import.meta.vitest
    describe("#master-data-facade.ts", () => {

        const facade = new MasterDataFacade(factory.buildMasterDataRepository(), factory.buildCacheService())

        const test1 = ".loadCountries()"
        test(test1, async () => {
            console.time(test1)

            const countries = await facade.loadCountriesAsync()

            const countriesFromCache = await facade.loadCountriesAsync()

            countries.forEach(country => {
                const exists = countriesFromCache.find(c => c.code.isEqual(country.code))
                expect(exists).toBeTruthy()
            })

            console.timeEnd(test1)
        })
    })
}
