import { Gender } from "src/core/enums/user/profile.enum"

export class UserProfileUpdate {
    constructor(
        public readonly userId?: string,
        public readonly fullName?: string,
        public readonly address?: string,
        public readonly gender?: Gender,
        public readonly phoneNumber?: string,
        public readonly allergies?: string[],
        public readonly currentMedication?: string[],
        public readonly preferredLanguage?: string
    ) {}

    static create(data: {
        userId?: string
        fullName?: string
        address?: string
        gender?: Gender
        phoneNumber?: string
        allergies?: string[]
        currentMedication?: string[]
        preferredLanguage?: string
    }): UserProfileUpdate {
        return new UserProfileUpdate(
            data.userId,
            data.fullName,
            data.address,
            data.gender,
            data.phoneNumber,
            data.allergies,
            data.currentMedication,
            data.preferredLanguage
        )
    }
}