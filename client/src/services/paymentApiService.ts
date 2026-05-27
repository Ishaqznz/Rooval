import { apiRequest } from "@/api"
import { CREATE_CHECKOUT_SESSION } from "@/graphql/queries/payment"

export const paymentServiceApi = {
    createCheckoutSession: async (variables: { input: { appointmentId: string }, fields: string }) => {
        const queryObj = CREATE_CHECKOUT_SESSION(variables.fields)
        return apiRequest({ ...queryObj, variables })
    }
}