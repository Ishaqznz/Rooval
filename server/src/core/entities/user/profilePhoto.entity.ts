export class ProfilePhoto {
    constructor(
        public profilePhoto: string,
        public userId: string
    ) {}

    static create(
        profilePhoto: string, 
        userId: string
    ): ProfilePhoto {
        return new ProfilePhoto(
            profilePhoto,
            userId
        )
    }
}