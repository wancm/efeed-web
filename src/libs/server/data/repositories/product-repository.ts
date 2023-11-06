import { Collection, ObjectId, SortDirection } from "mongodb"
import { appSettings } from "@/libs/appSettings"
import "@/libs/shared/extensions"
import { testHelper } from "@/libs/shared/utils/test-helper"
import { masterDataRepository } from "./master-data-repository"
import { Product, productConverter, ProductEntity } from "@/libs/shared/types/product"
import { UrlTypes } from "@/libs/shared/types/image"
import { MONGO_DB_CONSTANT } from "@/libs/server/data/mongodb/mongodb_const"
import { appMongodb } from "@/libs/server/data/mongodb/mongodb-database"

class ProductRepository {

    private isStartup = false
    private productCollection: Collection<ProductEntity>

    constructor() {
        this.productCollection = appMongodb.db.collection(MONGO_DB_CONSTANT.COLLECTION_PRODUCTS)
    }

    async startupAsync(): Promise<void> {

        if (this.isStartup) return

        /* c8 ignore start */

        const collections = await appMongodb.db.listCollections().toArray()

        const colIndexFound = collections
            .findIndex(c => c.name.isEqual(MONGO_DB_CONSTANT.COLLECTION_PRODUCTS))

        if (colIndexFound < 0) {
            // create collection

            // https://mongodb.github.io/node-mongodb-native/3.0/api/Db.html#createCollection
            await appMongodb.db.createCollection(MONGO_DB_CONSTANT.COLLECTION_PRODUCTS)

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_PRODUCTS} db collection created`)

            // create indexes

            const indexCreatedResult = await this.productCollection.createIndex({
                businessUnitId: 1
            }, { name: "businessUnitId_asc" })

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_PRODUCTS} db collection indexes created: ${indexCreatedResult} `)

            const indexCreatedResult1 = await this.productCollection.createIndex({
                businessUnitId: 1,
                name: 1
            }, { name: "businessUnitId_asc_name_asc", unique: true })

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_PRODUCTS} db collection indexes created: ${indexCreatedResult1} `)

            const indexCreatedResult2 = await this.productCollection.createIndex({
                createdDate: -1
            }, { name: "createdDate_desc" })

            console.log(`${MONGO_DB_CONSTANT.COLLECTION_PRODUCTS} db collection indexes created: ${indexCreatedResult2} `)
        }

        this.isStartup = true

        /* c8 ignore end */
    }

    async loadOneAsync(objId: ObjectId): Promise<Product> {
        const query = { _id: objId }

        const doc = await this.productCollection.findOne(query)
        return productConverter.toDTO(doc as ProductEntity)
    }

    async loadByBusinessUnitIdAsync(businessUnitId: ObjectId): Promise<Product[]> {

        // define an query document
        const query = {
            businessUnitId
        }

        // https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/read-operations/sort/
        // sort in descending (-1) order by
        const dir: SortDirection = "asc"
        const sort = { "name": dir }

        const cursor = this.productCollection
            .find(query)
            .sort(sort)

        const products: Product[] = []
        for await (const doc of cursor) {
            products.push(productConverter.toDTO(doc))
        }

        return products
    }

    async saveAsync(product: Product, createdBy: string): Promise<ObjectId> {
        const entity = productConverter.toEntity(product, createdBy)

        const result = await this.productCollection.insertOne(entity)

        return result.insertedId
    }
}

export const productRepository = new ProductRepository()

if (import.meta.vitest) {
    const { describe, expect, test, beforeEach } = import.meta.vitest

    beforeEach(async (_) => {
        await masterDataRepository.startupAsync()
        await productRepository.startupAsync()
    })

    describe("#product-repository.ts", () => {

        const test1 = ".saveAsync, loadOneAsync, loadManyAsync"
        test(test1, async () => {
            console.time(test1)

            const countryCode = "MY"
            const businessUnitId = new ObjectId().toHexString()

            const countries = await masterDataRepository.loadCountriesAsync()
            const malaysia = countries.find(c => c.code.isEqual(countryCode))

            const mockProduct = async (): Promise<Product> => {
                return {
                    businessUnitId,
                    name: `${testHelper.generateRandomString(5)} ${testHelper.generateRandomString(5)}`,
                    price: testHelper.generateRandomNumber(2),
                    currencyCode: malaysia?.currency?.code,
                    image: {
                        urls: [{
                            uri: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.rainforestcruises.com%2Fguides%2Findia-food&psig=AOvVaw37xL1ysYF81v__sCsTVXDw&ust=1698674642103000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCOj4n6e2m4IDFQAAAAAdAAAAABAE",
                            type: UrlTypes.Main,
                        }]
                    }
                }
            }

            const objId = await productRepository.saveAsync(await mockProduct(), appSettings.systemId)
            const objId2 = await productRepository.saveAsync(await mockProduct(), appSettings.systemId)

            const product = await productRepository
                .loadOneAsync(new ObjectId(objId))
            expect(product.id).toEqual(objId.toHexString())

            const products = await productRepository
                .loadByBusinessUnitIdAsync(new ObjectId(businessUnitId))

            expect(products.filter(p => p.id?.isEqual(objId.toHexString()))).not.toBeNull()
            expect(products.filter(p => p.id?.isEqual(objId2.toHexString()))).not.toBeNull()

            console.timeEnd(test1)
        }, 120000)
    })
}