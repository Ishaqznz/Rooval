export interface IDoctorOnboard {
    username: string
    gender: string
    phone: string
    registrationNumber: string
    country: string
    state: string
    experience: string
    bio: string
    specializations: string[]
    consultationModes: string[]
    consultationFee: string
    languages: string[]
    consultationDuration: string
    preferredMode: string
    acceptingPatients: boolean
    profileVisibility: boolean
    profilePhoto: string
    rejectionReason?: string
}