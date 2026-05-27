import { ValueObject } from "../valueObject";
import { IFeeRange } from "src/core/interfaces/doctor/listing.interface";

export class FeeRangeVO extends ValueObject<IFeeRange> {
  private constructor(props: IFeeRange) {
    super(props);
  }

  public get minFee(): number | undefined {
    return this.props.minFee;
  }

  public get maxFee(): number | undefined {
    return this.props.maxFee;
  }

  public static create(
    minFee?: number,
    maxFee?: number
  ): { ok: true; value: FeeRangeVO } | { ok: false; error: string } {

    if (minFee !== undefined) {
      if (typeof minFee !== "number" || minFee < 0) {
        return { ok: false, error: "minFee must be a non-negative number" };
      }
    }

    if (maxFee !== undefined) {
      if (typeof maxFee !== "number" || maxFee < 0) {
        return { ok: false, error: "maxFee must be a non-negative number" };
      }
    }

    if (
      minFee !== undefined &&
      maxFee !== undefined &&
      minFee > maxFee
    ) {
      return { ok: false, error: "minFee cannot be greater than maxFee" };
    }

    return {
      ok: true,
      value: new FeeRangeVO({ minFee, maxFee }),
    };
  }
}
