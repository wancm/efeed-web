import countryByAbbreviation from "country-json/src/country-by-abbreviation.json";
import countryByCallingCode from "country-json/src/country-by-calling-code.json";
import countryByCurrencyCode from "country-json/src/country-by-currency-code.json";
import { masterDataRepository } from "../repositories/master-data-repository";
import commonCurrency from "./../../data/common-currency.json";
import { Country } from "../../shared/types/countries";

class CountryService {
    loadCountriesMasterDataFromCountryJs(): Country[] {
        const countries: Country[] = [];

        countryByAbbreviation.forEach(country => {
            const countryEntity: Country = {
                code: country.abbreviation,
                name: country.country
            }

            const callingCode = countryByCallingCode.find(c => c.country === country.country);

            if (callingCode) countryEntity.callingCode = callingCode.calling_code;

            const currencyCode = countryByCurrencyCode.find(c => c.country === country.country);

            if (currencyCode?.currency_code) {
                const currencyCodeStr = currencyCode.currency_code.trim().toUpperCase();
                if ((commonCurrency as any)[currencyCodeStr]) {
                    const currency = (commonCurrency as any)[currencyCodeStr];
                    countryEntity.currency = {
                        code: currencyCodeStr,
                        minorUnit: currency.decimal_digits,
                        symbol: currency.symbol,
                        name: currency.name,
                        symbolNative: currency.symbol_native,
                        namePlural: currency.name_plural
                    };
                }
            }

            countries.push(countryEntity);
        });

        return countries;
    }

    async refreshCountriesMasterDataAsync(forceRefresh: boolean = false) {
        const countries = await masterDataRepository.loadCountriesAsync();

        if (countries.length === 0 || forceRefresh) {
            const loadedCountries = countryService.loadCountriesMasterDataFromCountryJs();
            await masterDataRepository.saveCountriesAsync(loadedCountries);
        }
    }
}

export const countryService = new CountryService();

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest;

    describe("country-service.ts #loadCountriesMasterDataFromCountryJs", () => {

        beforeEach(async (context) => {
            await masterDataRepository.startupAsync();
        })

        test('refresh countries master data', async (context) => {
            await countryService.refreshCountriesMasterDataAsync();

            const countries = await masterDataRepository.loadCountriesAsync();

            expect(countries.length).greaterThan(0);
        });
    })
}