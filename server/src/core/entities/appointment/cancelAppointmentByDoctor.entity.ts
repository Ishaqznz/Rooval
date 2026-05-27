export class CancelAppointmentByDoctor {
    constructor(
        public readonly input: {
            appointmentId: string
            reason: string
        }
    ) {}

    static create(input: {
        appointmentId: string
        reason: string
    }) {
        return new CancelAppointmentByDoctor(input)
    }
}