import BusinessUnit from "../shared/types/business-unit";

class UtilUnitTest {
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

    mockBusinessUnit(): object {
        return {
            name: `${utilUnitTest.generateRandomString(20)} ${utilUnitTest.generateRandomString(20)}`,
            code: utilUnitTest.generateRandomString(10),
            contactPersons: [{
                lastName: utilUnitTest.generateRandomString(20),
                email: `${utilUnitTest.generateRandomString(10)}@unittest.com`,
                contact: {
                    addresses: [{
                        line1: utilUnitTest.generateRandomString(15),
                        countryCode: 'MY'
                    }],
                    phones: [{
                        number: utilUnitTest.generateRandomNumber(10),
                        countryCodeNumber: 123,
                        type: 'Primary'
                    }]
                },
                type: 'BusinessUnitManager'
            }],
            shops: [{
                code: utilUnitTest.generateRandomString(10),
                name: `${utilUnitTest.generateRandomString(20)} ${utilUnitTest.generateRandomString(20)}`,
                products: []
            }],
            createdBy: utilUnitTest.generateRandomString(10)
        }
    }
}

export const utilUnitTest = new UtilUnitTest();