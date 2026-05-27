import { Gender } from "src/core/enums/user/profile.enum";

export interface IUpdateProfileRequestDTO {
  userId?: string
  fullName?: string;
  address?: string;
  gender?: Gender
  phoneNumber?: string;
  allergies?: string[];
  currentMedication?: string[];
  preferredLanguage?: string;
}
