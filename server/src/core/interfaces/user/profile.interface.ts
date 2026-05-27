export interface IUserProfile {
    personal: {
        profilePhoto: string
        address: string
        phoneNumber: string
        gender: string
    }

    health: {
        allergies: string[]
        currentMedication: string[]
        preferredLanguage: string
    }
}