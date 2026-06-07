export const CREATE_REVIEW = () => ({
    query: `
        mutation createReview($input: CreateReviewInput!) {
            createReview(input: $input)
        }
    `
})


export const GET_REVIEW_BY_USER_ID = (fields: string) => ({
    query: `
        query getReviewsByUserId {
            getReviewsByUserId {
                ${ fields }
            }
        }
    `
})


export const GET_REVIEW_BY_DOCTOR_ID = (fields: string) => ({
    query: `
        query getReviewsByDoctorId {
            getReviewsByDoctorId {
                ${ fields }
            }
        }
    `
})

export const GET_DOCTOR_AVERAGE_RATING = () => ({
    query: `
        query getAverageRating($input: GetAverageRatingInput!) {
            getAverageRating(input: $input) 
        }
    `
})


export const FIND_REVIEWS_BY_DOCTOR_ID = (fields: string) => ({
    query: `
        query findReviewsByDoctorId($input: FindReviewsByDoctorIdInput!) {
            findReviewsByDoctorId(input: $input) { 
                ${ fields }
            }
        }
    `
})