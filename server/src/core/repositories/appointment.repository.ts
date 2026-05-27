import { Appointment } from "../entities/appointment/appointment.entity"
import { CancelAppointment } from "../entities/appointment/cancelAppointment.entity"
import { CancelAppointmentByDoctor } from "../entities/appointment/cancelAppointmentByDoctor.entity"
import { ExtendedAppointment } from "../entities/appointment/extendedAppointment.entity"
import { AppointmentOverlap } from "../entities/appointment/getAppointment.entity"
import { ListAllAppointments } from "../entities/appointment/listAllAppointment.entity"
import { ListAppointments } from "../entities/appointment/listAppointment.entity"
import { ListUserAppointments } from "../entities/appointment/listUserAppointments.entity"
import { ListRole } from "../enums/user/role.enum"

export interface IAppointmentRepository {
    create(entity: Appointment): Promise<string>
    findById(appointmentId: string): Promise<ExtendedAppointment>
    findUserAppointments(userId: string): Promise<ExtendedAppointment[]>
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
}