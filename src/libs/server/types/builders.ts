/** https://refactoring.guru/design-patterns/builder */

import { Address, Contact, Phone } from "../../shared/types/contacts";
import { Person } from "../../shared/types/person";
import { Shop } from "../../shared/types/shop";

export type ContactBuilder = {
    setPrimaryAddress: (address: Address) => void,
    setPrimaryPhone: (phone: Phone) => void
}

export type PersonBuilder = {
    setContact: (contact: Contact) => void,
    setName: (lastName: string, firstName?: string) => void;
    setDateOfBirth: (date: Date) => void;
}

export type BusinessUnitBuilder = {
    addPerson: (person: Person) => void
}

export type ShopBuilder = {
    addPerson: (person: Person) => void,
    addProduct: (shop: Shop) => void
}