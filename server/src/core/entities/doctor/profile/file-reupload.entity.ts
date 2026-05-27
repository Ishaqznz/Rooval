export class FileReUpload {
    constructor(
        public certificates: string[],
        public doctorId: string
    ) {}

    static create(
        certificates: string[],
        doctorId: string
    ): FileReUpload {
        return new FileReUpload(
            certificates,
            doctorId
        )
    }
}