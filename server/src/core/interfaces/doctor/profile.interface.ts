import { DoctorSpecialization } from "src/core/enums/doctor/profile.enums"

export interface IDoctorProfile {
    personal: {
        username: string
        gender: string
        phone: string
        country: string
        state: string
        experience: number
        bio: string
        specializations: [DoctorSpecialization]
        languages: [string]
        registrationNumber: string
        preferredMode: string
        profileVisibility: boolean
    }

    clinic: {
        name: string
        address: string
        phoneNumber: string
        country: string
        workingDays: string
    }

    consultationSettings: {
        type: string
        consultationModes: [string]
        consultationFee: number
        inPersonFee: number
        videoFee: number
        duration: string
        sessionBufferTime: string
        cancellationPolicy: string
    }
}