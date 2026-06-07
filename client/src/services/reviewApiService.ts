import { apiRequest } from "@/api"
import { CREATE_REVIEW, FIND_REVIEWS_BY_DOCTOR_ID, GET_DOCTOR_AVERAGE_RATING, GET_REVIEW_BY_DOCTOR_ID, GET_REVIEW_BY_USER_ID } from "@/graphql/queries/reviews"

export const reviewApiService = {
    createReview: async (variables: { input: {
        doctorId: string
        appointmentId: string
        rating: number
        review: string
    }}) => {
        const queryObj = CREATE_REVIEW();
        return apiRequest({ ...queryObj, variables })
    },

    getReviewsByUserId: async (fields: string) => {
        const queryObj = GET_REVIEW_BY_USER_ID(fields)
        return apiRequest({ ...queryObj })
    },

    getReviewsByDoctorId: async (fields: string) => {
        const queryObj = GET_REVIEW_BY_DOCTOR_ID(fields)
        return apiRequest({ ...queryObj })
    },

    getAverageRating: async (variables: { input: {
        doctorId: string
    }}) => {
        const queryObj = GET_DOCTOR_AVERAGE_RATING();
        return apiRequest({ ...queryObj, variables })
    },

    findReviewsByDoctorId: async (variables: { input: {
        doctorId: string
    }}, fields: string) => {
        const queryObj = FIND_REVIEWS_BY_DOCTOR_ID(fields)
        return apiRequest({ ...queryObj, variables })
    }
}