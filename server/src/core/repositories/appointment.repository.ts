import { Appointment } from "../entities/appointment/appointment.entity"
import { CancelAppointment } from "../entities/appointment/cancelAppointment.entity"
import { CancelAppointmentByDoctor } from "../entities/appointment/cancelAppointmentByDoctor.entity"
import { ChangeAppointmentStatus } from "../entities/appointment/changeAppointmentStatus.entity"
import { DeleteAppointmentsBySession } from "../entities/appointment/deleteAppointmentsBySession.entity"
import { ExtendedAppointment } from "../entities/appointment/extendedAppointment.entity"
import { AppointmentOverlap } from "../entities/appointment/getAppointment.entity"
import { IsAvailableByStatus } from "../entities/appointment/isAvailableByStatus.entity"
import { ListAllAppointments } from "../entities/appointment/listAllAppointment.entity"
import { ListAppointments } from "../entities/appointment/listAppointment.entity"
import { ListUserAppointments } from "../entities/appointment/listUserAppointments.entity"

export interface IAppointmentRepository {
    create(entity: Appointment): Promise<string>
    findById(appointmentId: string): Promise<ExtendedAppointment>
    findUserAppointments(userId: string): Promise<ExtendedAppointment[]>
    findDoctorAppointments(doctorId: string): Promise<ExtendedAppointment[]>
    findOverLapping(entity: AppointmentOverlap): Promise<ExtendedAppointment[]>
    cancelAppointment(entity: CancelAppointment): Promise<boolean>
    cancelAppointmentByDoctor(entity: CancelAppointmentByDoctor): Promise<boolean>
    getByUserIds(userIds: string[]): Promise<ExtendedAppointment[]>
    getByDoctorIds(doctorIds: string[]): Promise<ExtendedAppointment[]>
    listAppointments(entity: ListAppointments): Promise<ExtendedAppointment[]> 
    listUserAppointments(entity: ListUserAppointments): Promise<ExtendedAppointment[]>
    listAllAppointments(entity: ListAllAppointments): Promise<ExtendedAppointment[]>
    countByDoctorId(doctorId: string): Promise<number>
    countByUserId(userId: string): Promise<number>
    countAll(): Promise<number>
    deleteUnpaidSessionAppointments(entity: DeleteAppointmentsBySession): Promise<boolean>
    isAvailableByStatus(entity: IsAvailableByStatus): Promise<boolean>
    existsByAppointmentNo(appointmentNo: number): Promise<boolean>
    changeAppointmentStatus(entity: ChangeAppointmentStatus): Promise<boolean>
    changeReviewStatus(appointmentId: string, value: boolean): Promise<boolean>
    findAllAppointments(): Promise<ExtendedAppointment[]>
}