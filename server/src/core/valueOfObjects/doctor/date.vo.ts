import { ValueObject } from "../valueObject";
import { IDate } from "src/core/interfaces/doctor/availabilitySessions.interface";

export class DateVO extends ValueObject<IDate> {
  private constructor(props: IDate) {
    super(props);
  }

  public get value(): string {
    return this.props.date;
  }

  private static toDate(date: string): Date {
    return new Date(`${date}T00:00:00`);
  }

  public static create(
    date: string
  ): { ok: true; value: DateVO } | { ok: false; error: string } {

    if (!date || typeof date !== "string") {
      return { ok: false, error: "Date is required" };
    }

    const pureDate = date.split("T")[0];

    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(pureDate)) {
      return { ok: false, error: "Date must be in YYYY-MM-DD format" };
    }

    const parsed = this.toDate(pureDate);

    if (isNaN(parsed.getTime())) {
      return { ok: false, error: "Invalid calendar date" };
    }

    return { ok: true, value: new DateVO({ date }) };
  }
}
