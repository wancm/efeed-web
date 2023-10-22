/** https://refactoring.guru/design-patterns/builder */

import Contact, { Address, Phone } from "../../types/contacts";
import Person from "../../types/person";
import Shop from "../../types/shop";

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
    addContactPerson: (contact: Person) => void,
    addShop: (shop: Shop) => void
}

export type ShopBuilder = {
    addContactPerson: (contact: Person) => void,
    addProduct: (shop: Shop) => void
}