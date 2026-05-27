import { ConsultationType, OrderBy } from "src/core/enums/doctor/doctor.enums"
import { DoctorSortBy } from "src/core/enums/doctor/doctor.enums"

export interface IListDoctorsRequestDTO {
    pagination: {
        page: number
        limit: number
    }

    sorting: {
        sortBy: DoctorSortBy
        order: OrderBy
    }

    filter: {
        search?: string
        specialization?: string[]
        city?: string
        consultationType?: ConsultationType
        minExperience?: number
        minFee?: number
        maxFee?: number
        minRating?: number
        availableToday?: boolean
    }
}