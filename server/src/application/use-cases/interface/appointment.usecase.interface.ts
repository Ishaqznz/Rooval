import { ICancelAppointmentRequestDTO } from "src/application/dto/appointment/request/cancel.request.dto"
import { ICancelAppointmentByDoctorRequestDTO } from "src/application/dto/appointment/request/cancelByDoctor.request.dto"
import { ICreateAppointmentRequestDTO } from "src/application/dto/appointment/request/create.request.dto"
import { IListAppointmentsRequestDTO } from "src/application/dto/appointment/request/list.request.dto"
import { IAppointmentResponseDTO } from "src/application/dto/appointment/response/appointment.response.dto"
import { IListAppointmentsResponseDTO } from "src/application/dto/appointment/response/list.response.dto"
import { IListAllAppointmentsRequestDTO } from "src/application/dto/appointment/request/listAll.request.dto"
import { IListUserAppointmentsRequestDTO } from "src/application/dto/appointment/request/listUser.request.dto"
import { IAppointmentAvailabilitySession } from "src/core/interfaces/doctor/availabilitySessions.interface"
import { IChangeAppointmentStatusDTO } from "src/application/dto/appointment/request/changeAppointmentStatus.request.dto."

export interface IAppointmentUseCase {
    findById(appointmentId: string): Promise<IAppointmentResponseDTO>
    createAppointment(input: ICreateAppointmentRequestDTO): Promise<string>
    findAllAppointments(): Promise<IAppointmentResponseDTO[]>
    findUserAppointments(userId: string): Promise<IAppointmentResponseDTO[]>
    findDoctorAppointments(doctorId: string): Promise<IAppointmentResponseDTO[]>
    cancelAppointment(input: ICancelAppointmentRequestDTO): Promise<boolean>
    cancelAppointmentByDoctor(input: ICancelAppointmentByDoctorRequestDTO): Promise<boolean>
    getUserAppointments(userIds: string[]): Promise<IAppointmentResponseDTO[]>
    getDoctorAppointments(doctorIds: string[]): Promise<IAppointmentResponseDTO[]>
    listAppointments(input: IListAppointmentsRequestDTO): Promise<IListAppointmentsResponseDTO>
    listUserAppointments(input: IListUserAppointmentsRequestDTO): Promise<IListAppointmentsResponseDTO>
    listAllAppointments(input: IListAllAppointmentsRequestDTO): Promise<IListAppointmentsResponseDTO>
    deleteUnpaidSessionAppointments(input: IAppointmentAvailabilitySession): Promise<boolean>
    isAvailableByStatus(input: IAppointmentAvailabilitySession): Promise<boolean>
    changeAppointmentStatus(input: IChangeAppointmentStatusDTO): Promise<boolean>
    changeReviewStatus(appointmentId: string, value: boolean): Promise<boolean>
}