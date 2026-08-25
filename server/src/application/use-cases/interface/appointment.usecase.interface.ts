import { ICancelAppointmentRequestDTO } from "../../dto/appointment/request/cancel.request.dto"
import { ICancelAppointmentByDoctorRequestDTO } from "../../dto/appointment/request/cancelByDoctor.request.dto"
import { ICreateAppointmentRequestDTO } from "../../dto/appointment/request/create.request.dto"
import { IListAppointmentsRequestDTO } from "../../dto/appointment/request/list.request.dto"
import { IAppointmentResponseDTO } from "../../dto/appointment/response/appointment.response.dto"
import { IListAppointmentsResponseDTO } from "../../dto/appointment/response/list.response.dto"
import { IListAllAppointmentsRequestDTO } from "../../dto/appointment/request/listAll.request.dto"
import { IListUserAppointmentsRequestDTO } from "../../dto/appointment/request/listUser.request.dto"
import { IAppointmentAvailabilitySession } from "../../../core/interfaces/doctor/availabilitySessions.interface"
import { IChangeAppointmentStatusDTO } from "../../dto/appointment/request/changeAppointmentStatus.request.dto."

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