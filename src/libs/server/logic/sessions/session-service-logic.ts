import { CacheService } from "@/libs/server/types/services/cache-service"
import { Session } from "@/libs/shared/types/session"
import { PersonRepository } from "@/libs/server/types/repositories/person-repository"
import { SessionService } from "@/libs/server/types/services/session-service"
import { MemoryCacheService } from "@/libs/shared/cache/memory-cache-service"
import { MongoDbPersonRepository } from "@/libs/server/data/repositories/mongodb-person-repository"
import { ObjectId } from "mongodb"
import { util } from "@/libs/shared/utils/util"

export class SessionServiceLogic implements SessionService {
    private readonly prefix = "SESSION-"
    private readonly sessionTTL = 20 * 60 * 1000 // 20 minutes

    constructor(private memoryCacheService: CacheService,
                private personRepository: PersonRepository) {
    }

    async initAsync(email: string): Promise<Session> {

        const id = util.genId()

        const person = await this.personRepository.findByEmailAsync(email)

        const session = {
            id,
            email,
            businessUnitId: person?.businessUnitId ?? "",
        } as const

        await this.memoryCacheService.trySetAsync(`${this.prefix}${id}`, session, this.sessionTTL)

        return session
    }

    async getAsync(id: string): Promise<Session> {
        return await this.memoryCacheService.tryGetAsync(`${this.prefix}${id}`)
    }

    async expiredAsync(id: string): Promise<void> {
        await this.memoryCacheService.tryExpiredAsync(`${this.prefix}${id}`)
        return
    }

    async resetExpiryAsync(id: string): Promise<void> {
        await this.memoryCacheService.extendExpiryAsync(`${this.prefix}${id}`, this.sessionTTL)
        return
    }
}


if (import.meta.vitest) {
    const { describe, expect, test, vi, afterEach } = import.meta.vitest
    describe("#session-service-logic.ts", () => {

        afterEach(() => {
            vi.restoreAllMocks()
        })

        const test1 = ".initAsync, .getAsync, .expiredAsync"
        test(test1, async () => {
            console.time(test1)

            const personRepository = new MongoDbPersonRepository()

            const findByEmailAsync = () => {
            }

            const mock = vi.fn().mockImplementation(findByEmailAsync)
            mock.mockImplementationOnce(async (email: string) =>
                Promise.resolve(
                    {
                        email,
                        businessUnitId: new ObjectId().toHexString()
                    }
                )
            )

            personRepository.findByEmailAsync = mock

            const service = new SessionServiceLogic(new MemoryCacheService(), personRepository)
            const session = await service.initAsync("test@test.com")

            util.delay(500)

            const getSession = await service.getAsync(session.id)
            expect(getSession.id).toEqual(session.id)

            util.delay(500)

            await service.expiredAsync(session.id)

            const getExpiredSession = await service.getAsync(session.id)
            expect(getExpiredSession).toBeUndefined()

            util.delay(500)

            await service.resetExpiryAsync(session.id)

            console.timeEnd(test1)
        })
    })
}