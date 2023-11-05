import { AddressTypes, PhoneTypes } from "@/libs/shared/types/contacts";
import { PersonTypes } from "@/libs/shared/types/person";
import { Country } from "@/libs/shared/types/country";

class TestHelper {
    generateRandomString(length: number): string {
        let result = '';
        const characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    };

    generateRandomNumber(length: number): number {
        let result = '';
        const characters =
            '123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return parseInt(result);
    };

    mockPerson(country?: Country) {
        return {
            lastName: testHelper.generateRandomString(5),
                firstName: testHelper.generateRandomString(10),
            dateOfBirth: '26051982',
            email: `${testHelper.generateRandomString(5)}@${testHelper.generateRandomString(3)}.com`,
            contact: {
            addresses: [{
                line1: testHelper.generateRandomString(15),
                line2: testHelper.generateRandomString(15),
                line3: testHelper.generateRandomString(15),
                state: testHelper.generateRandomString(8),
                city: testHelper.generateRandomString(15),
                countryCode: country?.code,
                type: AddressTypes.Primary
            }],
                phones: [{
                number: testHelper.generateRandomNumber(10),
                countryCodeNumber: country?.callingCode ?? 0,
                type: PhoneTypes.Primary
            }]
        },
            type: PersonTypes.Internal
        }
    }
}

export const testHelper = new TestHelper();