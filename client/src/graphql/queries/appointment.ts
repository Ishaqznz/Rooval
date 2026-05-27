export const CREATE_APPOINTMENT = () => ({
    query: `#graphql
    mutation createAppointment($input: CreateAppointmentInput!) {
        createAppointment(input: $input)
    }
 `,
    variables: {}
})

export const FIND_APPOINTMENTS = (fields: string) => ({
    query: `#graphql 
        query findUserAppointments {
            findUserAppointments {
                ${fields}
            }
        }`
    ,
    variables: {}
})

export const CANCEL_APPOINTMENT = () => ({
    query: `
        mutation cancelAppointment($input: CancelAppointmentInput!) {
            cancelAppointment(input: $input)
        }
    `,
    variables: {}
})

export const CANCEL_APPOINTMENT_BY_DOCTOR = () => ({
    query: `
        mutation cancelAppointmentByDoctor($input: CancelAppointmentByDoctorInput!) {
            cancelAppointmentByDoctor(input: $input)
        }
    `,
    variables: {}
})

export const LIST_APPOINTMENTS = (fields: string) => ({
    query: `
        query listAppointments($input: ListAppointmentsInput!) {
            listAppointments(input: $input) {
                ${fields}
            }
        }
    `,
    varaibles: {}
})

export const LIST_USER_APPOINTMENTS = (fields: string) => ({
    query: `
        query listUserAppointments($input: ListAppointmentsInput!) {
            listUserAppointments(input: $input) {
                ${ fields }
            }
        } 
    `
})

export const LIST_ALL_APPOINTEMNTS = (fields: string) => ({
    query: `
        query listAllAppointments($input: ListAllAppointmentsInput!) {
            listAllAppointments(input: $input) {
                ${ fields }
            }
        }
    `
})