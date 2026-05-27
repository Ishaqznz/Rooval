import { DayOfWeek } from "src/core/enums/doctor/availability.enums"
import { IAvailabilitySessions } from "src/core/interfaces/doctor/availabilitySessions.interface"

export interface IUpsertAvailabilityRequestDTO {
    doctorId: string
    dayOfWeek: DayOfWeek
    sessions: IAvailabilitySessions
    slotDuration: string
    startDate: string
    endDate?: string
    timezone: string
}