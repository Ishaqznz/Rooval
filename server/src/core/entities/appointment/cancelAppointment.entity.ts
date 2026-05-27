export class CancelAppointment {
    private constructor(
        public readonly appointmentId: string,
        public readonly reason: string
    ) {}

    static create(
        appointmentId: string,
        reason: string
    ): CancelAppointment {
        return new CancelAppointment(
            appointmentId,
            reason
        )
    }
}