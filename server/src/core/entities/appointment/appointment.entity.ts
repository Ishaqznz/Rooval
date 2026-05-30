import { UserIdVO } from "src/core/valueOfObjects/user/userId.vo";
import { DoctorIdVO } from "src/core/valueOfObjects/doctor/doctorId.vo";
import { AppointmentTypeVO } from "src/core/valueOfObjects/appointment/appointmentType.vo";
import { AppointmentAmountVO } from "src/core/valueOfObjects/appointment/amount.vo";
import { BufferTimeVO } from "src/core/valueOfObjects/appointment/bufferTime.vo";
import { AppointmentSlotDurationVO } from "src/core/valueOfObjects/appointment/slotDuration.vo";
import { IAppointmentAvailabilitySession } from "src/core/interfaces/doctor/availabilitySessions.interface";
import { DoctorAppointmentType } from "src/core/enums/user/appointment.enums";

export class Appointment {
  constructor(
    public userId: string,
    public doctorId: string,
    public session: IAppointmentAvailabilitySession,
    public appointmentType: DoctorAppointmentType,
    public amount: number,
    public slotDuration: number,
    public bufferTime: number,
    public appointmentNo: number
  ) {}

  public static create(
    userId: string,
    doctorId: string,
    session: IAppointmentAvailabilitySession,
    appointmentType: DoctorAppointmentType,
    amount: number,
    slotDuration: number,
    bufferTime: number,
    appointmentNo: number
  ): { ok: true; value: Appointment } | { ok: false; error: string } {

    const userIdResult = UserIdVO.create(userId);
    if (userIdResult.ok == false) return { ok: false, error: userIdResult.error };

    const doctorIdResult = DoctorIdVO.create(doctorId);
    if (doctorIdResult.ok == false) return { ok: false, error: doctorIdResult.error };

    const typeResult = AppointmentTypeVO.create(appointmentType);
    if (typeResult.ok == false) return { ok: false, error: typeResult.error };

    const amountResult = AppointmentAmountVO.create(amount);
    if (amountResult.ok == false) return { ok: false, error: amountResult.error };

    const slotResult = AppointmentSlotDurationVO.create(slotDuration);
    if (slotResult.ok == false) return { ok: false, error: slotResult.error };

    const bufferResult = BufferTimeVO.create(bufferTime);
    if (bufferResult.ok == false) return { ok: false, error: bufferResult.error };

    const appointment = new Appointment(
      userIdResult.value.value,
      doctorIdResult.value.value,
      session,
      typeResult.value.value,
      amountResult.value.value,
      slotResult.value.value,
      bufferResult.value.value,
      appointmentNo
    );

    return { ok: true, value: appointment };
  }
}