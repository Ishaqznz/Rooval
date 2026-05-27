import { StringExpression } from "mongoose"
import { DayOfWeek } from "src/core/enums/doctor/availability.enums"
import { IAvailabilitySession } from "src/core/interfaces/doctor/availabilitySessions.interface"

export interface IAvailabilityResponseDTO {
    id: string
    doctorId: string
    dayOfWeek: DayOfWeek
    isAvailable: boolean
    sessions: IAvailabilitySession[]
    slotDuration: number
    startDate: string
    endDate?: string
    timezone: string
}