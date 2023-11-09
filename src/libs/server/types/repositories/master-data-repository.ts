import { Country } from "@/libs/shared/types/country"
import { ObjectId } from "mongodb"

export type MasterDataRepository = {
    loadCountriesAsync(): Promise<Country[]>

    saveCountriesAsync(countries: Country[]): Promise<ObjectId>
}