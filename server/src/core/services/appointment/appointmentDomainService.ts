export class AppointmentDomainService {
    static createAppointmentNo(): number {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000);
        return Number(timestamp.slice(-7) + random.toString().padStart(3, '0'));
    }

}