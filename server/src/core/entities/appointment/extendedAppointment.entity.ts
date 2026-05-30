import { IAppointmentAvailabilitySession } from "src/core/interfaces/doctor/availabilitySessions.interface";
import { AppointmentStatus, DoctorAppointmentType, PaymentStatus } from "src/core/enums/user/appointment.enums";

export class ExtendedAppointment {
  private constructor(
    public readonly id: string,
    public readonly patientId: string,
    public readonly doctorId: string,

    public readonly session: IAppointmentAvailabilitySession,
    public readonly status: AppointmentStatus,
    public readonly type: DoctorAppointmentType,
    public readonly appointmentNo: number,

    public readonly reason?: string,
    public readonly notes?: string,

    public readonly paymentStatus?: PaymentStatus,
    public readonly amount?: number,
    public readonly paymentId?: string,

    public readonly cancelledBy?: string,
    public readonly cancelReason?: string,

    public readonly slotDuration?: number,
    public readonly bufferTime?: number,

    public readonly reminderSent?: boolean,
    public readonly isCheckedIn?: boolean,

    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  public static create(data: {
    id: string;
    patientId: string;
    doctorId: string;

    session: {
      startTime: Date;
      endTime: Date;
    };

    status: string;
    type: string;
    appointmentNo: number

    reason?: string;
    notes?: string;

    paymentStatus?: PaymentStatus;
    amount?: number;
    paymentId?: string;

    cancelledBy?: string;
    cancelReason?: string;

    slotDuration?: number;
    bufferTime?: number;

    reminderSent?: boolean;
    isCheckedIn?: boolean;

    createdAt?: Date;
    updatedAt?: Date;
  }): ExtendedAppointment {

    return new ExtendedAppointment(
      data.id,
      data.patientId,
      data.doctorId,
      data.session,

      data.status as AppointmentStatus, 
      data.type as DoctorAppointmentType,    
      data.appointmentNo,

      data.reason,
      data.notes,
      data.paymentStatus,
      data.amount,
      data.paymentId,
      data.cancelledBy,
      data.cancelReason,
      data.slotDuration,
      data.bufferTime,
      data.reminderSent,
      data.isCheckedIn,
      data.createdAt,
      data.updatedAt
    );
  }
}