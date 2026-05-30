import { ICreateAppointmentRequestDTO } from "src/application/dto/appointment/request/create.request.dto";
import { Appointment } from "src/core/entities/appointment/appointment.entity";
import { ExtendedAppointment } from "src/core/entities/appointment/extendedAppointment.entity";
import { IAppointmentResponseDTO } from "src/application/dto/appointment/response/appointment.response.dto";

export class AppointmentInputMapper {
    static toAppointmentEntity(
        input: ICreateAppointmentRequestDTO, appointmentNo: number
    ): { ok: true, value: Appointment } | { ok: false, error: string } {

        const appointmentEntity = Appointment.create(
            input.userId,
            input.doctorId,
            {
                startTime: input.session.startTime,
                endTime: input.session.endTime
            },
            input.appointmentType,
            input.amount,
            input.slotDuration,
            input.bufferTime,
            appointmentNo
        )

        if (appointmentEntity.ok == false) {
            return { ok: false, error: appointmentEntity.error }
        }

        return { ok: true, value: appointmentEntity.value }
    }

    static toAppointmentDtos(
        entities: ExtendedAppointment[]
    ): { ok: true; value: IAppointmentResponseDTO[] } | { ok: false; error: string } {

        const appointments = entities.map((entity) => ({
            id: entity.id,
            patientId: entity.patientId,
            doctorId: entity.doctorId,
            session: {
                startTime: entity.session.startTime,
                endTime: entity.session.endTime
            },
            status: entity.status,
            type: entity.type,
            appointmentNo: entity.appointmentNo,
            reason: entity.reason,
            notes: entity.notes,
            paymentStatus: entity.paymentStatus,
            amount: entity.amount,
            paymentId: entity.paymentId,
            cancelledBy: entity.cancelledBy,
            cancelReason: entity.cancelReason,
            slotDuration: entity.slotDuration,
            bufferTime: entity.bufferTime,
            reminderSent: entity.reminderSent,
            isCheckedIn: entity.isCheckedIn,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt
        }));

        return { ok: true, value: appointments };
    }
}