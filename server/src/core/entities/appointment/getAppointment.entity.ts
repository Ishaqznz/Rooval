
export class AppointmentOverlap {
    constructor(
        public readonly doctorId: string,
        public readonly minStart: Date,
        public readonly maxEnd: Date
    ) {}

    static create(
        doctorId: string,
        minStart: Date,
        maxEnd: Date
    ): AppointmentOverlap {
        return new AppointmentOverlap(
            doctorId,
            minStart,
            maxEnd
        )
    }
}