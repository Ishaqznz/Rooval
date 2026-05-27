import { ValueObject } from "../valueObject";

export class BufferTimeVO extends ValueObject<{ buffer: number }> {
  private constructor(props: { buffer: number }) {
    super(props);
  }

  public static create(buffer: number) {
    if (buffer < 0) {
      return { ok: false, error: "Buffer time cannot be negative" };
    }
    return { ok: true, value: new BufferTimeVO({ buffer }) };
  }

  public get value(): number {
    return this.props.buffer;
  }
}