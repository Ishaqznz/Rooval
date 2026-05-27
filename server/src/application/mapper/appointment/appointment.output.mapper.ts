import { ExtendedAppointment } from "src/core/entities/appointment/extendedAppointment.entity";
import { IAppointmentResponseDTO } from "src/application/dto/appointment/response/appointment.response.dto";

export class AppointmentOutputMapper {
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
  
  static toAppoitmentDto(
    entity: ExtendedAppointment
  ): { ok: true; value: IAppointmentResponseDTO } | { ok: false; error: string } {
    const appointment =  {
      id: entity.id,
      patientId: entity.patientId,
      doctorId: entity.doctorId,
      session: {
        startTime: entity.session.startTime,
        endTime: entity.session.endTime
      },
      status: entity.status,
      type: entity.type,
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
    }

    return { ok: true, value: appointment }
  }
}