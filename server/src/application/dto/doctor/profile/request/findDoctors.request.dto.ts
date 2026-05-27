import { ConsultationFilter, DoctorSortField, DoctorSortOrder, DoctorStatusFilter } from "src/core/enums/doctor/doctor.enums"

export interface IFindDoctorsRequestDTO {
    page: number
    limit: number
    search?: string
    filter?: DoctorStatusFilter
    specialization?: string
    consultationMode?: ConsultationFilter
    minExperience?: number
    maxExperience?: number
    sortBy?: DoctorSortField
    sortOrder?: DoctorSortOrder
}