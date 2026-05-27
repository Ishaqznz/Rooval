import { apiRequest } from "@/api"
import { NotificationType } from "@/interfaces/notifications/notification.interfaces"
import { MARK_ALL_AS_READ, SEND_ADMIN_NOTIFICATION } from "@/graphql/queries/notification"
import { RealAudience } from "@/interfaces/notifications/notification.interfaces"

export const notificationApiService = {
    markAllAsRead: async () => {
        const queryObj = MARK_ALL_AS_READ()
        return apiRequest(queryObj)
    },

    notifyMany: async (variables: { input: { 
        audience: RealAudience,
        type: NotificationType,
        content: string
    }}) => {
        const queryObj = SEND_ADMIN_NOTIFICATION();
        return apiRequest({ ...queryObj, variables })
    }
}