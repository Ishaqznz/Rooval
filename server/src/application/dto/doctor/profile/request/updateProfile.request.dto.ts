export interface IUpdateProfileRequestDTO {
    fullName?: string
    phoneNumber?: string
    registrationNumber?: string
    bio?: string
    clinic?: {
        name?: string
        address?: string
        phoneNumber?: string
        country?: string
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