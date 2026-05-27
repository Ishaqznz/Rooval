export interface StepOne {
    profilePhoto: File
    userName: string
    gender: "male" | "female" | "other"
    phoneNumber: string
    medicalRegistrationNumber: string
    country: string
    state: string
    yoe: number
    bio: string
}

export interface StepTwo {
    specialiazations: string[]
    consultationModes: string[]
    videoConsultationFee: number
    languageSpoken: string[]
    certification: File
}

export interface StepThree {
    consultationDuration: string
    preferredConsulationMode: string
    AcceptingNewPatients: boolean
    profileVisibility: boolean
}

