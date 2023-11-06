import { ObjectId } from "mongodb"
import { util } from "@/libs/shared/utils/util"
import { NullableString } from "@/libs/shared/types/types"

class MongoDbUtil {
    /**
     * Generate instance of mongoDb ObjectId
     */
    genId(id?: NullableString): ObjectId {
        return !util.isStrEmpty(id)
            ? new ObjectId(id)
            : new ObjectId()
    }

    /**
     * Generate instance of mongoDb ObjectId
     * @return ObjectId
     * @return null if @id is nil or empty
     */
    genIdIfNotNil(id?: NullableString): ObjectId | null {
        return !util.isStrEmpty(id)
            ? new ObjectId(id)
            : null
    }
}

export const mongodbUtil = new MongoDbUtil()