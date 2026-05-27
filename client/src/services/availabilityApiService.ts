import { apiRequest } from "@/api";
import { DELETE_AVAILABILITIES, GET_SLOTS_BY_DATE, UPSERT_AVAILABILITY } from "@/graphql/queries/availability";
import { IUpsertAvailability } from "@/interfaces/doctor/availability.interface";

export const availabilityApiService = {
    upsert: async (variables: { input: IUpsertAvailability[] }) => {
        const queryObj = UPSERT_AVAILABILITY();
        return apiRequest({ ...queryObj, variables })
    },

    delete: async () => {
        const queryObj = DELETE_AVAILABILITIES();
        return apiRequest({ ...queryObj })
    },

    getSlotsBydate: async (variables: { input: { doctorId: string, date: Date }}) => {
        const queryObj = GET_SLOTS_BY_DATE();
        return apiRequest({ ...queryObj, variables})
    }
}