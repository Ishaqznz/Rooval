import { apiRequest } from "@/api"
import { CONVERSATION_UPDATE_LAST_MESSAGE, GET_USER_CONVERSATION, GET_USER_CONVERSATION_BY_ID } from "@/graphql/queries/conversation"

export const conversationApiService =  {
    getUserConversations: async (fields: string) => {
        const queryObj = GET_USER_CONVERSATION(fields)
        return apiRequest({ ...queryObj })
    },

    get: async (variables: { input: { conversationId: string }}, fields: string) => {
        const queryObj = GET_USER_CONVERSATION_BY_ID(fields)
        return apiRequest({ ...queryObj, variables })
    },

    updateLastMessage: async (variables: { input: { conversationId: string, lastMessage: string, lastMessageType: 'text' | 'image' | 'document' }}) => {
        const queryObj = CONVERSATION_UPDATE_LAST_MESSAGE();
        return apiRequest({ ...queryObj, variables })
    }
} 