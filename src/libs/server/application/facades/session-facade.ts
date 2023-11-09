import { Session } from "@/libs/shared/types/session"
import { SessionService } from "@/libs/server/types/services/session-service"
import { factory } from "@/libs/server/factory"

class SessionFacade {

    private sessionService: SessionService = factory.buildSessionService()

    async initAsync(email: string): Promise<Session> {
        return this.sessionService.initAsync(email)
    }

    async getAsync(id: string): Promise<Session> {
        return this.sessionService.getAsync(id)
    }
}
