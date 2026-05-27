import { IDoctorResponseDTO } from "src/application/dto/auth/response/login.response.dto";
import { IListDoctorsResponseDTO } from "src/application/dto/doctor/profile/response/listDoctors.response.dto";
import { Doctor } from "src/core/entities/doctor/profile/doctor.entity";
import { ListDoctorsPayload } from "src/core/entities/doctor/profile/listDoctorsPayload.entity";

export class DoctorOutputMapper {
    static toDoctorDTO(doctor: Doctor): IDoctorResponseDTO {
        return {
            id: doctor.id,
            fullName: doctor.fullName,
            email: doctor.email,
            role: doctor.role,
            password: doctor.password,
            status: doctor.status,
            profile: doctor.profile,
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
            profile: doctorDto.profile,
            profilePhoto: doctorDto.profilePhoto,
            certificates: doctorDto.certificates
        }))

        return doctorsDto;
    }

    static toListDoctorsDTO(doctors: ListDoctorsPayload[], doctorsCount: number): IListDoctorsResponseDTO {
        const doctorsDto = doctors.map((doctorDto) => ({
            id: doctorDto.id,
            fullName: doctorDto.fullName,
            email: doctorDto.email,
            role: doctorDto.role,
            password: doctorDto.password,
            status: doctorDto.status,
            profile: doctorDto.profile,
            profilePhoto: doctorDto.profilePhoto,
            certificates: doctorDto.certificates,
        }))

        return { doctors: doctorsDto, doctorsCount }
    }
}