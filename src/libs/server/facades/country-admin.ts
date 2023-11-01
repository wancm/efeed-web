import { cacheService } from "./../../shared/cache/cache-service";
import { Country } from "./../../shared/types/countries";
import { masterDataRepository } from "./../core/repositories/master-data-repository";

class CountryAdmin {

    private readonly COUNTRIES_CACHE_KEY = 'countries';

    async loadCountriesAsync(): Promise<Country[]> {

        let countries = await cacheService.tryGetAsync<Country[]>(this.COUNTRIES_CACHE_KEY);

        if (countries) {
            return countries;
        }

        countries = await masterDataRepository.loadCountriesAsync();

        cacheService.trySetAsync(this.COUNTRIES_CACHE_KEY, countries, -1);

        return countries;
    }
}

export const countryAdmin = new CountryAdmin();

if (import.meta.vitest) {
    const { describe, expect, test } = import.meta.vitest;
    describe("#shop-repository.ts", () => {

        const test1 = '.loadCountries()';
        test(test1, async () => {
            console.time(test1);

            const countries = await masterDataRepository.loadCountriesAsync();

            console.timeEnd(test1);
        })
    })
}
