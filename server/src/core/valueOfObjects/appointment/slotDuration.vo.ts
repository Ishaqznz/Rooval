import { ValueObject } from "../valueObject";

export class AppointmentSlotDurationVO extends ValueObject<{ duration: number }> {
  private constructor(props: { duration: number }) {
    super(props);
  }

  public static create(duration: number) {
    if (duration <= 0) {
      return { ok: false, error: "Invalid slot duration" };
    }
    return { ok: true, value: new AppointmentSlotDurationVO({ duration }) };
  }

  public get value(): number {
    return this.props.duration;
  }
}