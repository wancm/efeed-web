import { ObjectId } from "mongodb";
import { util } from "../../../shared/utils/util";

class MongoDbUtil {
    genId(id?: string): ObjectId {
        return !util.isStrEmpty(id)
            ? new ObjectId(id)
            : new ObjectId();
    }
}

export const mongodbUtil = new MongoDbUtil();