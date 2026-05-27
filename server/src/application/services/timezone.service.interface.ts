export interface ITimeZoneService {
    toUTC(date: string, time: string, timezone: string): Date
}