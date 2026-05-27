export enum NotificationType {
    MESSAGE = 'message',
    APPOINTMENT = 'appointment',
    PAYMENT = 'payment',
    VIDEO_CALL = 'video_call',
    SYSTEM = 'system',
    SECURITY = 'security',
    ANNOUNCEMENT = 'announcement',
    ALERT = 'alert',
    REMINDER = 'reminder'
}

export enum Audience {
    USER = 'user',
    DOCTOR = 'doctor',
    BOTH = 'both'
}


export enum NotificationMessages {
    NEW_APPOINTMENT_CREATED = 'New Appointment Created!',
    NEW_USER_CREATED = 'New User Created!'
}

export enum NotificationErrorType {
    GIVE_VALID_AUDIENCE_TYPE = 'Give valid audience type!'
}