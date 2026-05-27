export class FileUpload {
    constructor(
        public profilePhoto: string,
        public certificates: string[],
        public doctorId: string
    ) {}

    static create(
        profilePhoto: string,
        certificates: string[],
        doctorId: string
    ): FileUpload {
        return new FileUpload(
            profilePhoto, 
            certificates,
            doctorId
        )
    }
}