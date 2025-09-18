import { DoctorOutputDto } from "src/application/DTO/doctor/login/login.output.dto";

export interface IDoctorRepository {
    findAll(): Promise<DoctorOutputDto[]>
    findByEmail(email: string): Promise<DoctorOutputDto>
    findById(id: string): Promise<DoctorOutputDto>
}