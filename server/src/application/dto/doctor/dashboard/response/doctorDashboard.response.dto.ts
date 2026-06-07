import { DashboardStats } from "src/adapters/api/graphQL/types/doctor/model/dashboardStats.model";
import { RatingOverview } from "src/adapters/api/graphQL/types/doctor/model/ratingOverview.model";
import { RevenueOverview } from "src/adapters/api/graphQL/types/doctor/model/revenueOverview.model";
import { IAppointmentResponseDTO } from "src/application/dto/appointment/response/appointment.response.dto";
import { IReviewResponseDTO } from "src/application/dto/reviews/response/review.response.dto";

export interface IDoctorDashboardResponseDTO {
    stats: DashboardStats
    ratings: RatingOverview
    revenue: RevenueOverview
    todayAppointments: IAppointmentResponseDTO[]
    recentReviews: IReviewResponseDTO[]
}