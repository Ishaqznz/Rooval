import { IDoctorResponseDTO } from "src/application/DTO/doctor/login/login.response.dto";
import { Doctor } from "src/core/entities/doctor/doctor.entity";

export class DoctorOutputMapper {
    static toDoctorDTO(doctor: Doctor): IDoctorResponseDTO {
        return {
            id: doctor.id,
            fullName: doctor.fullName,
            email: doctor.email,
            role: doctor.role,
            password: doctor.password,
            status: doctor.status,
            onboarding: doctor.onboarding,
            profilePhoto: doctor.profilePhoto,
            certificates: doctor.certificates
        }
    }

    static toDoctorsDTO(doctor: Doctor[]): IDoctorResponseDTO[] {
        const doctorsDto = doctor.map((doctorDto) => ({
            id: doctorDto.id,
            fullName: doctorDto.fullName,
            email: doctorDto.email,
            role: doctorDto.role,
            password: doctorDto.password,
            status: doctorDto.status,
            onboarding: doctorDto.onboarding,
            profilePhoto: doctorDto.profilePhoto,
            certificates: doctorDto.certificates
        }))

        return doctorsDto;
    }
}