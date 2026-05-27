import { ConsultationFilter, SortField, SortOrder, StatusFilter } from "@/types/doctor.types"

export interface IFindDoctors {
    page: number
    limit: number
    search: string
    filter: StatusFilter
    specialization: string
    consultationMode: ConsultationFilter
    minExperience: number
    maxExperience: number
    sortBy: SortField
    sortOrder: SortOrder
}