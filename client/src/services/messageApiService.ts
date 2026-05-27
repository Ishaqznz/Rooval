import { apiRequest } from "@/api"
import { GET_MESSAGES, MESSAGE_MARK_AS_READ, UPLOAD_FILE } from "@/graphql/queries/message"

export const messageApiService = {
    get: async (variables: { input: { conversationId: string } }, fields: string) => {
        const queryObj = GET_MESSAGES(fields)
        return apiRequest({ ...queryObj, variables })
    },

    markAsRead: async (variables: { input: { conversationId: string, userId: string } }) => {
        const queryObj = MESSAGE_MARK_AS_READ()
        return apiRequest({ ...queryObj, variables })
    },

    uploadFile: async (data: { input: { file: File } }) => {
        const formData = new FormData();

        const operations = JSON.stringify({
            query: UPLOAD_FILE().query,
            variables: {
                input: {
                    file: null,
                },
            },
        });

        formData.append("operations", operations);

        const map = {
            "0": ["variables.input.file"],
        };

        formData.append("map", JSON.stringify(map));

        formData.append("0", data.input.file);

        return apiRequest(
            {
                ...UPLOAD_FILE(),
                formData,
            },
            "message:uploadFile"
        );
    }
}