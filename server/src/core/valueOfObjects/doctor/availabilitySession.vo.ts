import { ValueObject } from "../valueObject";
import { IAvailabilitySessions } from "../../interfaces/doctor/availabilitySessions.interface";

export class AvailabilitySessionsVO extends ValueObject<{
  sessions: IAvailabilitySessions;
}> {
  private constructor(props: { sessions: IAvailabilitySessions }) {
    super(props);
  }

  public get value(): IAvailabilitySessions {
    return this.props.sessions;
  }

  public static create(
    sessions: IAvailabilitySessions
  ): { ok: true; value: AvailabilitySessionsVO } | { ok: false; error: string } {
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return { ok: false, error: "Availability sessions must be a non-empty array" };
    }

    for (const session of sessions) {
      if (
        typeof session.startTime !== "string" ||
        typeof session.endTime !== "string"
      ) {
        return { ok: false, error: "Invalid session time format" };
      }
    }

    return {
      ok: true,
      value: new AvailabilitySessionsVO({ sessions }),
    };
  }
}
