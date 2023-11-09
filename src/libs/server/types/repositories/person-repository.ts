import { Person } from "@/libs/shared/types/person"

export type PersonRepository = {
    loadOneAsync(id: string): Promise<Person>

    loadByBusinessUnitIdAsync(businessUnitId: string): Promise<Person[]>

    saveAsync(person: Person, createdBy: string): Promise<string>

    findByEmailAsync(email: string): Promise<Person | undefined>

    existsEmailAsync(email: string): Promise<boolean>

    findByQueryTextAsync(businessUnitId: string, queryText: string): Promise<Person | undefined>
}