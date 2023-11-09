import { Session } from "@/libs/shared/types/session"

export type SessionService = {
    initAsync(email: string): Promise<Session>

    getAsync(id: string): Promise<Session>

    expiredAsync(id: string): Promise<void>

    resetExpiryAsync(id: string): Promise<void>
}