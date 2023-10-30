import { masterDataRepository } from "../../core/repositories/master-data-repository";
import { Country } from "../types/countries";

class CountryAdmin {
    async loadCountriesAsync(): Promise<Country[]> {
        const countries = await masterDataRepository.loadCountriesAsync();

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
