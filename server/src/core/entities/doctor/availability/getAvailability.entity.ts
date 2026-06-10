import { AvailabilityDomainService } from "src/core/services/doctor/availability.service.core";
import { DateVO } from "src/core/valueOfObjects/doctor/date.vo";
import { DayOfWeekVO } from "src/core/valueOfObjects/doctor/dayOfWeek.vo";
import { DoctorIdVO } from "src/core/valueOfObjects/doctor/doctorId.vo";

export class GetAvailability {
    private constructor(
        public readonly doctorId: DoctorIdVO,
        public readonly dayOfWeek: DayOfWeekVO,
        public readonly timezone: string
    ) { }

    public static create(
        doctorId: string,
        date: string,
        timezone: string
    ): { ok: true; value: GetAvailability } | { ok: false; error: string } {

        const doctorIdOrError = DoctorIdVO.create(doctorId);
        if (doctorIdOrError.ok == false) return doctorIdOrError;

        const dateOrError = DateVO.create(date)
        if (dateOrError.ok == false) return dateOrError;

        const dayOfWeek = AvailabilityDomainService.getDayOfWeek(date, timezone)
        const dayOfWeekOrError = DayOfWeekVO.create(dayOfWeek);
        
        if (dayOfWeekOrError.ok == false) return dayOfWeekOrError;

        return {
            ok: true,
            value: new GetAvailability(
                doctorIdOrError.value,
                dayOfWeekOrError.value,
                timezone
            ),
        };
    }
}