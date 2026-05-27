import { ValueObject } from "../valueObject";
import { DayOfWeek } from "../../enums/doctor/availability.enums";

export class DayOfWeekVO extends ValueObject<{ dayOfWeek: DayOfWeek }> {
  private constructor(props: { dayOfWeek: DayOfWeek }) {
    super(props);
  }

  public get value(): string {
    return this.props.dayOfWeek;
  }

  public static create(
    dayOfWeek: DayOfWeek
  ): { ok: true; value: DayOfWeekVO } | { ok: false; error: string } {
    if (!Object.values(DayOfWeek).includes(dayOfWeek)) {
      return { ok: false, error: "Invalid day of week" };
    }

    return { ok: true, value: new DayOfWeekVO({ dayOfWeek }) };
  }
}
