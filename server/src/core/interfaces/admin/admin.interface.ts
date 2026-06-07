export interface AdminDashboardStats {
    totalUsers: number;
    totalDoctors: number;
    approvedDoctors: number;
    pendingDoctors: number;
    rejectedDoctors: number;
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
}

export interface AdminRevenueOverview {
    todayRevenue: number;
    monthlyRevenue: number;
    totalRevenue: number;
    doctorPayouts: number;
    platformProfit: number;
}

