import { DashboardStats } from "../../../../../adapters/api/graphql/types/doctor/model/dashboardStats.model";
import { RatingOverview } from "../../../../../adapters/api/graphql/types/doctor/model/ratingOverview.model";
import { RevenueOverview } from "../../../../../adapters/api/graphql/types/doctor/model/revenueOverview.model";
import { IAppointmentResponseDTO } from "../../../appointment/response/appointment.response.dto";
import { IReviewResponseDTO } from "../../../reviews/response/review.response.dto";

export interface IDoctorDashboardResponseDTO {
    stats: DashboardStats
    ratings: RatingOverview
    revenue: RevenueOverview
    todayAppointments: IAppointmentResponseDTO[]
    recentReviews: IReviewResponseDTO[]
}