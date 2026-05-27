import { ConsultationType } from "src/core/enums/doctor/doctor.enums";

export interface IDoctorOnboardingRequestDTO {
  username: string;
  gender: string;
  phone: string;
  registrationNumber: string;
  country: string;
  state: string;
  experience: number;
  bio: string;
  specializations: string[];
  consultationModes: ConsultationType[];
  consultationFee: number;
  languages: string[];
  consultationDuration: number;
  preferredMode: ConsultationType;
  acceptingPatients: boolean;
  profileVisibility: boolean;
  id: string
}
