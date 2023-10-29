import { Db } from 'mongodb';
import { appSettings } from './../../../appSettings';
import { mongoDbClient } from './mongodb-client';

class MongoDbDatabase {

    private readonly dbVal: Db;

    get db(): Db {
        return this.dbVal;
    }

    constructor() {
        if (appSettings.isProd) {
            this.dbVal = mongoDbClient.db(process.env.MONGO_DB_NAME);
        } else {
            // we are in vitest unit test context now
            // use *_test db
            this.dbVal = mongoDbClient.db(process.env.MONGO_DB_NAME_UNIT_TEST);
        }
    }
}

export const appMongodb = new MongoDbDatabase();