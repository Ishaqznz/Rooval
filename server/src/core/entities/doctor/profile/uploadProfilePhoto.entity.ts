export class UploadDoctorProfilePhoto {
    constructor(
        public readonly input: {
            doctorId: string
            profilePhoto: string
        }
    ) { }

    static create(
        input: {
            doctorId: string
            profilePhoto: string
        }
    ): UploadDoctorProfilePhoto {
        return new UploadDoctorProfilePhoto(input)
    }
}