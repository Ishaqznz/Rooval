export const UPSERT_AVAILABILITY = () => ({
    query: `#graphql
        mutation upsertDoctorAvailability($input: [UpsertDoctorAvailabilityInput!]!) {
            upsertDoctorAvailability(input: $input)
        }
    `, 
    varibles: {}
})

export const DELETE_AVAILABILITIES = () => ({
    query: `#graphql
        mutation {
            deleteDoctorAvailabilities
        }
    `,
})

export const GET_SLOTS_BY_DATE = () => ({
    query: `#graphql
        query getDoctorSlotsByDate($input: SlotInput!) {
            getDoctorSlotsByDate(input: $input) {
                startTime
                endTime
            }
        }
    `
})