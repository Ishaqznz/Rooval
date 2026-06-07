import { apiRequest } from "@/api";
import { CANCEL_APPOINTMENT, CANCEL_APPOINTMENT_BY_DOCTOR, CHANGE_APPOINTMENT_STATUS, CREATE_APPOINTMENT, FIND_APPOINTMENTS, LIST_ALL_APPOINTEMNTS, LIST_APPOINTMENTS, LIST_USER_APPOINTMENTS } from "@/graphql/queries/appointment";
import { AppointmentStatus, ICreateAppointment, IListAppointment } from "@/interfaces/user/appointment.interface";

export const appointmentServiceApi = {
    create: async (variables: { input: ICreateAppointment }) => {
        const queryObj = CREATE_APPOINTMENT()
        return apiRequest({ ...queryObj, variables })
    },

    find: async (fields: string) => {
        const queryObj = FIND_APPOINTMENTS(fields)
        return apiRequest({ ... queryObj })
    },

    cancel: async (variables: { input: { appointmentId: string, reason: string }}) => {
        const queryObj = CANCEL_APPOINTMENT()
        return apiRequest({ ...queryObj, variables })
    },

    cancelByDoctor: async (variables: { input: { appointmentId: string, reason: string }}) => {
        const queryObj = CANCEL_APPOINTMENT_BY_DOCTOR()
        return apiRequest({ ...queryObj, variables })
    },

    list: async (variables: { input: IListAppointment, fields: string }) => {
        const queryObj = LIST_APPOINTMENTS(variables.fields)
        return apiRequest({ ...queryObj, variables })
    },
    
    listUser: async (variables: { input: IListAppointment, fields: string}) => {
       const queryObj = LIST_USER_APPOINTMENTS(variables.fields)
       return apiRequest({ ...queryObj, variables })
    },

    listAll: async (variables: { input: IListAppointment, fields: string }) => {
        const queryObj = LIST_ALL_APPOINTEMNTS(variables.fields)
        return apiRequest({ ...queryObj, variables })
    },

    changeAppointmentStatus: async (variables: { input: {
        appointmentId: string
        status: AppointmentStatus
    }}) => {
        const queryObj = CHANGE_APPOINTMENT_STATUS();
        return apiRequest({ ...queryObj, variables })
    }
}