import { IDoctorResponseDTO } from "../../../auth/response/login.response.dto";

export interface IListDoctorsResponseDTO {
  doctors: IDoctorResponseDTO[]
  doctorsCount: number
}
