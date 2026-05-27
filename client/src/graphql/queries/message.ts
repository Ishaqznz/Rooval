export const GET_MESSAGES = (fields: string) => ({
    query: `
        query getMessages($input: GetMessagesInput!) {
            getMessages(input: $input) {
                ${ fields }
            }
        }
    `
})

export const MESSAGE_MARK_AS_READ = () => ({
    query: `
        mutation markAsRead($input: MarkAsReadInput!) {
            markAsRead(input: $input) 
        } 
    `
})

export const DELETE_ALL_MESSAGES = () => ({
    query: `
        mutation deleteAllMesssage
    `
})

export const UPLOAD_FILE = () => ({
    query: `
        mutation uploadMessageFile($input: UploadMessageFileInput!) {
            uploadMessageFile(input: $input) 
        }
    `
})