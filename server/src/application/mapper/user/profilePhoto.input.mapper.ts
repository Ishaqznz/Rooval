import { ProfilePhoto } from "src/core/entities/user/profilePhoto.entity";


export class ProfilePhotoInputMapper {
    static toProfilePhotoEntity(file: string, userId: string): ProfilePhoto {
        return ProfilePhoto.create(
            file, userId
        )
    }
}