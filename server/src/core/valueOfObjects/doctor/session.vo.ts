import { IAvailabilitySession } from "src/core/interfaces/doctor/availabilitySessions.interface";
import { ValueObject } from "../valueObject";

export class SessionVO extends ValueObject<{ session: IAvailabilitySession }> {
  private constructor(props: { session: IAvailabilitySession }) {
    super(props);
  }

  public static create(session: IAvailabilitySession) {
    if (!session || !session.startTime || !session.endTime) {
      return { ok: false, error: "Invalid session data" };
    }
    return { ok: true, value: new SessionVO({ session }) };
  }

  public get value(): IAvailabilitySession {
    return this.props.session;
  }
}