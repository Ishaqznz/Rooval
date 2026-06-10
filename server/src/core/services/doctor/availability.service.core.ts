import { DayOfWeek, SlotDuration } from "src/core/enums/doctor/availability.enums";
import { IAvailabilitySessions, ISlot } from "src/core/interfaces/doctor/availabilitySessions.interface";
import { timeToMinutes } from "src/core/helper/timeToMinutes";

export class AvailabilityDomainService {
  static hasValidTimeRange(sessions: IAvailabilitySessions): boolean {
    return sessions.every(
      session => timeToMinutes(session.startTime) < timeToMinutes(session.endTime)
    );
  }

  static isOverlapping(
    slot: { startTime: Date; endTime: Date },
    appointment: { startTime: Date; endTime: Date }
  ): boolean {
    return (
      slot.startTime < appointment.endTime &&
      slot.endTime > appointment.startTime
    );
  }

  static fitsSlotDuration(
    slotDuration: string
  ): boolean {
    const duration = Number(slotDuration)
    if (duration > SlotDuration.duration) {
      return false;
    }
    return true;
  }

  static getDayOfWeek(
    date: string,
    timeZone: string
  ): DayOfWeek {
    const weekday = new Intl.DateTimeFormat(
      "en-US",
      {
        weekday: "long",
        timeZone,
      }
    ).format(new Date(date));

    const map = {
      Sunday: DayOfWeek.SUNDAY,
      Monday: DayOfWeek.MONDAY,
      Tuesday: DayOfWeek.TUESDAY,
      Wednesday: DayOfWeek.WEDNESDAY,
      Thursday: DayOfWeek.THURSDAY,
      Friday: DayOfWeek.FRIDAY,
      Saturday: DayOfWeek.SATURDAY,
    };

    return map[weekday];
  }

  static toSlots(entities: any[]): ISlot[] {

    const slots: ISlot[] = [];

    for (const availability of entities) {

      for (const session of availability.sessions.value) {
        let current = new Date(session.startTimeUTC);
        const end = new Date(session.endTimeUTC);

        if (current >= end) {
          continue;
        }

        while (current < end) {
          const slotEnd = new Date(
            current.getTime() +
            Number(availability.slotDuration.value) * 60 * 1000
          );

          if (slotEnd <= end) {
            slots.push({
              startTime: new Date(current),
              endTime: slotEnd,
            });
          }

          current = slotEnd;
        }
      }
    }

    return slots;
  }
}
