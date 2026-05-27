export const GET_USER_CONVERSATION = (fields: string) => ({
    query: `
        query getUserConversations {
            getUserConversations {
                ${ fields }
            }
        }
    `
})

export const GET_USER_CONVERSATION_BY_ID = (fields: string) => ({
    query:  `
        query getConversationById($input: GetConversationByIdInput!) {
            getConversationById(input: $input) {
                ${ fields }
            }
        }
    `,
    varibles: {}
})

export const CONVERSATION_UPDATE_LAST_MESSAGE  = () => ({
    query: `
        mutation updateLastMessage($input: UpdateLastMessageInput!) {
            updateLastMessage(input: $input)
        }
    `,
    variables: {}
})