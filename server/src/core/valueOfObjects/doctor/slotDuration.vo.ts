import { ValueObject } from "../valueObject";

export class SlotDurationVO extends ValueObject<{ slotDuration: number }> {
  private constructor(props: { slotDuration: number }) {
    super(props);
  }

  public get value(): string {
    return (this.props.slotDuration).toString();
  }

  public static create(
    slotDuration: string
  ): { ok: true; value: SlotDurationVO } | { ok: false; error: string } {
    const duration = Number(slotDuration);

    if (isNaN(duration) || duration <= 0) {
      return { ok: false, error: "Invalid slot duration" };
    }

    return {
      ok: true,
      value: new SlotDurationVO({ slotDuration: duration }),
    };
  }
}
