import { DateTime } from "luxon";
import { ITimeZoneService } from "src/application/services/timezone.service.interface";

export class TimezoneService implements ITimeZoneService {
  toUTC(date: string, time: string, timezone: string): Date {
    return DateTime.fromISO(`${date}T${time}`, { zone: timezone })
      .toUTC()
      .toJSDate();
  }
}