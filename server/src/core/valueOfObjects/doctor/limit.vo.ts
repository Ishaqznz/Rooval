import { ValueObject } from "../valueObject";
import { ILimit } from "src/core/interfaces/doctor/listing.interface";

export class LimitVO extends ValueObject<ILimit> {
  private constructor(props: ILimit) {
    super(props);
  }

  public get value(): number {
    return this.props.limit;
  }

  public static create(
    limit: number
  ): { ok: true; value: LimitVO } | { ok: false; error: string } {

    if (typeof limit !== "number" || Number.isNaN(limit)) {
      return { ok: false, error: "Limit must be a number" };
    }

    if (!Number.isInteger(limit)) {
      return { ok: false, error: "Limit must be an integer" };
    }

    if (limit < 1 || limit > 100) {
      return { ok: false, error: "Limit must be between 1 and 100" };
    }

    return { ok: true, value: new LimitVO({ limit }) };
  }
}
