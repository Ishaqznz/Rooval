import { IDoctorProfile } from "src/core/interfaces/doctor/profile.interface";

export interface IDoctorResponseDTO {
  id: string;
  fullName: string;
  email: string;
  role: string;
  password: string;
  status: string;
  profile: IDoctorProfile
  profilePhoto: string
  certificates: string[]
}
