import { AppointmentType } from "../../enums/user/profile.enum";
import { ValueObject } from "../valueObject";
import { DoctorAppointmentType } from "../../enums/appointments/appointment.enums";

export class AppointmentTypeVO extends ValueObject<{ type: DoctorAppointmentType }> {
  private constructor(props: { type: DoctorAppointmentType }) {
    super(props);
  }

  public static create(type: DoctorAppointmentType) {
    if (!Object.values(DoctorAppointmentType).includes(type)) {
      return { ok: false, error: "Invalid appointment type" };
    }
    return { ok: true, value: new AppointmentTypeVO({ type }) };
  }

  public get value(): DoctorAppointmentType {
    return this.props.type;
  }
}