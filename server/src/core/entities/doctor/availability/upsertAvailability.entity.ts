import { DoctorIdVO } from "src/core/valueOfObjects/doctor/doctorId.vo";
import { DayOfWeekVO } from "src/core/valueOfObjects/doctor/dayOfWeek.vo";
import { AvailabilitySessionsVO } from "src/core/valueOfObjects/doctor/availabilitySession.vo";
import { SlotDurationVO } from "src/core/valueOfObjects/doctor/slotDuration.vo";
import { DayOfWeek } from "src/core/enums/doctor/availability.enums";
import { IAvailabilitySessions } from "src/core/interfaces/doctor/availabilitySessions.interface";
import { AvailabilityDomainService } from "src/core/services/doctor/availability.service.core";

export class Availability {
  private constructor(
    public readonly doctorId: DoctorIdVO,
    public readonly dayOfWeek: DayOfWeekVO,
    public readonly sessions: AvailabilitySessionsVO,
    public readonly slotDuration: SlotDurationVO,
    public readonly startDate: string,
    public readonly timezone: string,
    public readonly endDate?: string,
  ) {}

  public static create(
    doctorId: string,
    dayOfWeek: DayOfWeek,
    sessions: IAvailabilitySessions,
    slotDuration: string,
    startDate: string,
    timezone: string,
    endDate?: string,
  ): { ok: true; value: Availability } | { ok: false; error: string } {
    const doctorIdOrError = DoctorIdVO.create(doctorId);
    if (doctorIdOrError.ok == false) return doctorIdOrError;
    
    const dayOfWeekOrError = DayOfWeekVO.create(dayOfWeek);
    if (dayOfWeekOrError.ok == false) return dayOfWeekOrError;

    const sessionsOrError = AvailabilitySessionsVO.create(sessions);
    if (sessionsOrError.ok == false) return sessionsOrError;

    const slotDurationOrError = SlotDurationVO.create(slotDuration);
    if (slotDurationOrError.ok == false) return slotDurationOrError;

    if (!AvailabilityDomainService.hasValidTimeRange(sessions)) {
      return { ok: false, error: "Invalid session time range!"}
    }

    if (!AvailabilityDomainService.fitsSlotDuration(slotDuration)) {
      return { ok: false, error: "Invalid slot duration!"}
    }

    return {
      ok: true,
      value: new Availability(
        doctorIdOrError.value,
        dayOfWeekOrError.value,
        sessionsOrError.value,
        slotDurationOrError.value,
        startDate,
        timezone,
        endDate,
      ),
    };
  }
}
