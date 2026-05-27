export enum AppointmentType {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE'
}

export enum ListAppointmentType {
    ONLINE = 'online',
    OFFLINE = 'offline',
    BOTH = 'both'
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export interface ICreateAppointment {
    doctorId: string
    session: {
        startTime: string
        endTime: string
    }
    appointmentType: AppointmentType
    amount: number
    slotDuration: number
    bufferTime: number
}

export interface IListAppointment {
    page: number
    limit: number
    search?: string
    appointmentType?: ListAppointmentType,
    appointmentStatus?: AppointmentStatus
}