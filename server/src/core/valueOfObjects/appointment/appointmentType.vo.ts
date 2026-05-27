import { AppointmentType } from "src/core/enums/user/profile.enum";
import { ValueObject } from "../valueObject";

export class AppointmentTypeVO extends ValueObject<{ type: AppointmentType }> {
  private constructor(props: { type: AppointmentType }) {
    super(props);
  }

  public static create(type: AppointmentType) {
    if (!Object.values(AppointmentType).includes(type)) {
      return { ok: false, error: "Invalid appointment type" };
    }
    return { ok: true, value: new AppointmentTypeVO({ type }) };
  }

  public get value(): AppointmentType {
    return this.props.type;
  }
}