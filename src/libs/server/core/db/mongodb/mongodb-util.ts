import { ObjectId } from "mongodb"
import { util } from "@/libs/shared/utils/util"
import { NullableString } from "@/libs/shared/types/types"

class MongoDbUtil {
    genId(id?: NullableString): ObjectId {
        return !util.isStrEmpty(id)
            ? new ObjectId(id)
            : new ObjectId()
    }
}

export const mongodbUtil = new MongoDbUtil()