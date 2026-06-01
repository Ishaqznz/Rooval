export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum DoctorAppointmentType {
  ONLINE = 'online',
  OFFLINE = 'offline',
  BOTH = 'both'
}

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    FAILED = 'failed'
}

export enum AppointmentErrorType {
    SLOT_ALREADY_BOOKED = 'Slot already booked!',
    DOCTOR_NOT_ALLOWED_FOR_THIS_OPERATION = 'Doctor is not allowed for this operation!',
    APPOINTMENT_NOT_FOUND = 'Appointment not found!',
    APPOINTMENT_NOT_AVAILABLE = 'Appointment not available!',
}