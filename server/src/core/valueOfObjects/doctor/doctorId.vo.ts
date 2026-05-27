import { ValueObject } from "../valueObject";

export class DoctorIdVO extends ValueObject<{ doctorId: string }> {
  private constructor(props: { doctorId: string }) {
    super(props);
  }

  public get value(): string {
    return this.props.doctorId
  }

  public static create(
    doctorId: string
  ): { ok: true; value: DoctorIdVO } | { ok: false; error: string } {
    if (!doctorId || typeof doctorId !== "string") {
      return { ok: false, error: "Invalid doctor id" };
    }

    return { ok: true, value: new DoctorIdVO({ doctorId }) };
  }
}
