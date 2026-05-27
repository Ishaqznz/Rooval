import { ValueObject } from "../valueObject";
import { IPage } from "src/core/interfaces/doctor/listing.interface";

export class PageVO extends ValueObject<IPage> {
  private constructor(props: IPage) {
    super(props);
  }

  public get value(): number {
    return this.props.page;
  }

  public static create(
    page: number
  ): { ok: true; value: PageVO } | { ok: false; error: string } {

    if (typeof page !== "number" || Number.isNaN(page)) {
      return { ok: false, error: "Page must be a number" };
    }

    if (!Number.isInteger(page) || page < 1) {
      return { ok: false, error: "Page must be an integer greater than 0" };
    }

    return { ok: true, value: new PageVO({ page }) };
  }
}
