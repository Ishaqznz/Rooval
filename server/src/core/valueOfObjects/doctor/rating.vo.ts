import { ValueObject } from "../valueObject";
import { IRating } from "src/core/interfaces/doctor/listing.interface";

export class RatingVO extends ValueObject<IRating> {
  private constructor(props: IRating) {
    super(props);
  }

  public get value(): number {
    return this.props.rating;
  }

  public static create(
    rating: number
  ): { ok: true; value: RatingVO } | { ok: false; error: string } {

    if (typeof rating !== "number" || Number.isNaN(rating)) {
      return { ok: false, error: "Rating must be a number" };
    }

    if (rating < 0 || rating > 5) {
      return { ok: false, error: "Rating must be between 0 and 5" };
    }

    return { ok: true, value: new RatingVO({ rating }) };
  }
}
