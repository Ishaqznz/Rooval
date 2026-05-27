import { ObjectId } from "mongoose";
import { DayOfWeek } from "src/core/enums/doctor/availability.enums";
import { IAvailabilitySessions } from "src/core/interfaces/doctor/availabilitySessions.interface";

export interface IMongoAvailabilityDocument {
     _id: ObjectId,
     doctorId: ObjectId
     dayOfWeek: DayOfWeek
     isAvailable: boolean
     sessions: IAvailabilitySessions
     slotDuration: number
     startDate: string
     endDate?: string
     timezone: string
     createdAt: Date
     updatedAt: Date
     __v: number    
}