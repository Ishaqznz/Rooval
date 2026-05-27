export interface TimeSession {
  id: string;
  startTime: string;
  endTime: string;
  error?: string;
}

export interface DayAvailability {
  enabled: boolean;
  slotDuration: number;
  sessions: TimeSession[];
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

export interface Session {
  startTime: string
  endTime: string
}

export interface IUpsertAvailability {
  dayOfWeek: DayOfWeek,
  sessions: Session[],
  slotDuration: string
  startDate: string
  endDate?: string
  timezone: string
}

export const dayMap: Record<string, DayOfWeek> = {
  Monday: DayOfWeek.MONDAY,
  Tuesday: DayOfWeek.TUESDAY,
  Wednesday: DayOfWeek.WEDNESDAY,
  Thursday: DayOfWeek.THURSDAY,
  Friday: DayOfWeek.FRIDAY,
  Saturday: DayOfWeek.SATURDAY,
  Sunday: DayOfWeek.SUNDAY,
};

export interface Availability {
  dayOfWeek: DayOfWeek,
  sessions: [ { startTime: string, endTime: string }]
  slotDuration: number
}