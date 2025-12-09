import { IDoctorOnboard } from "src/core/interfaces/doctor/onboard.interface";

export interface IDoctorResponseDTO {
  id: string;
  fullName: string;
  email: string;
  role: string;
  password: string;
  status: string;
  onboarding: IDoctorOnboard
  profilePhoto: string
  certificates: string[]
}
