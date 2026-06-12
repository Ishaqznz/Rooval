import { IAppointmentResponseDTO } from "../../appointment/response/appointment.response.dto";
import { IDoctorResponseDTO } from "../../auth/response/login.response.dto";
import { IUserResponseDTO } from "../../auth/response/singup.response.dto";
import { AdminDashboardStats } from "src/core/interfaces/admin/admin.interface";
import { AdminRevenueOverview } from "src/adapters/api/graphql/types/user/model/adminRevenueOverview.model";

export interface IAdminDashboardResponseDTO {
    stats: AdminDashboardStats;
    revenue: AdminRevenueOverview;
    recentAppointments: IAppointmentResponseDTO[];
    recentlyRegisteredDoctors: IDoctorResponseDTO[];
    recentlyRegisteredUsers: IUserResponseDTO[];
}