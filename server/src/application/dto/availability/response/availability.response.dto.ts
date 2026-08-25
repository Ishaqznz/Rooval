import { StringExpression } from "mongoose"
import { DayOfWeek } from "../../../../core/enums/doctor/availability.enums"
import { IAvailabilitySession } from "../../../../core/interfaces/doctor/availabilitySessions.interface"

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