export interface IAvailabilitySession {
    startTime: string
    endTime: string
}

export interface IAppointmentAvailabilitySession {
  startTime: Date
  endTime: Date
}

export type IAvailabilitySessions = IAvailabilitySession[]

export interface IDate {
  date: string;
}

export interface ISlot {
  startTime: Date
  endTime: Date
}