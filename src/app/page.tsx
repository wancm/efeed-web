import { countryAdmin } from "@/libs/shared/facades/country-admin";

const loadCountries = async () => {
  return await countryAdmin.loadCountriesAsync();
};

export default async function Home() {
  const countries = await loadCountries();

  return <h1>{JSON.stringify(countries)}</h1>;
}
