import { apiRequest } from "@/api"
import { CREATE_CHECKOUT_SESSION, WITHDRAW_DOCTOR_MONEY, WITHDRAW_USER_MONEY } from "@/graphql/queries/payment"

export const paymentServiceApi = {
    createCheckoutSession: async (variables: { input: { appointmentId: string }, fields: string }) => {
        const queryObj = CREATE_CHECKOUT_SESSION(variables.fields)
        return apiRequest({ ...queryObj, variables })
    },

    withdrawUserMoney: async (variables: { input: {
        amount: number
        accountHolderName: string
        accountNumber: number
        bankName: string
        ifscCode: string
        notes?: string
    }}) => {
        const queryObj = WITHDRAW_USER_MONEY();
        return apiRequest({ ...queryObj, variables })
    },

    withdrawDoctorMoney: async (variables: { input: {
        amount: number
        accountHolderName: string
        accountNumber: number
        bankName: string
        ifscCode: string
        notes?: string
    }}) => {
        const queryObj = WITHDRAW_DOCTOR_MONEY();
        return apiRequest({ ...queryObj, variables })
    }
}