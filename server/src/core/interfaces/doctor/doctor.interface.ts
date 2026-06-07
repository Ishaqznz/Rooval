import { ConsultationFilter, DoctorSortField, DoctorSortOrder, DoctorStatusFilter } from "src/core/enums/doctor/doctor.enums"

export interface IDoctorQueryParams {
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

export interface DashboardStats {
    totalPatients: number
    totalAppointments: number
    upcomingAppointments: number
    completedAppointments: number
    cancelledAppointments: number
}

export interface RatingOverview {
    averageRating: number
    totalReviews: number
}

export interface RevenueOverview {
    availableBalance: number
    todayRevenue: number
    monthlyRevenue: number
    totalRevenue: number
}