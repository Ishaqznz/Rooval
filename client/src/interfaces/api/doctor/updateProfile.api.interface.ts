export interface IUpdateDoctorProfile {
    fullName?: string
    phoneNumber?: string
    registrationNumber?: string
    bio?: string
    clinic?: {
        name?: string
        phoneNumber?: string
        country?: string
        address?: string
        workingDays?: string
    }
    consultationSettings?: {
        type?: string
        inPersonFee?: number
        videoFee?: number
        duration?: number
        sessionBufferTime?: string
        cancellationPolicy?: string
    }
}