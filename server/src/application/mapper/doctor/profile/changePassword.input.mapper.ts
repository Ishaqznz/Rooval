import { ChangeDoctorPassord } from "src/core/entities/doctor/profile/changeDoctorPassword.entity";

export class ChangePasswordInputMapper {
    static toChangePasswordEntity(userId: string, password: string): ChangeDoctorPassord | string {
        const passEntity = ChangeDoctorPassord.create(userId, password)
        if (passEntity.ok == true) return passEntity.value;
        return passEntity.error
    }
}