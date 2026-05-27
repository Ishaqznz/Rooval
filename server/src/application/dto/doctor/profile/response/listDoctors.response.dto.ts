import { IDoctorResponseDTO } from "src/application/dto/auth/response/login.response.dto";

export interface IListDoctorsResponseDTO {
  doctors: IDoctorResponseDTO[]
  doctorsCount: number
}
