import { ConsultationType } from "src/core/enums/doctor/doctor.enums";

export class DoctorOnboarding {
  constructor(
    public username: string,
    public gender: string,
    public phone: string,
    public registrationNumber: string,
    public country: string,
    public state: string,
    public experience: number,
    public bio: string,
    public specializations: string[],
    public consultationModes: ConsultationType[],
    public consultationFee: number,
    public languages: string[],
    public consultationDuration: number,
    public preferredMode: ConsultationType,
    public acceptingPatients: boolean = true,
    public profileVisibility: boolean = true,
    public id: string,
  ) {}

  static create(
    username: string,
    gender: string,
    phone: string,
    registrationNumber: string,
    country: string,
    state: string,
    experience: number,
    bio: string,
    specializations: string[],
    consultationModes: ConsultationType[],
    consultationFee: number,
    languages: string[],
    consultationDuration: number,
    preferredMode: ConsultationType,
    acceptingPatients: boolean = true,
    profileVisibility: boolean = true,
    id: string,
  ): DoctorOnboarding {
    return new DoctorOnboarding(
      username,
      gender,
      phone,
      registrationNumber,
      country,
      state,
      experience,
      bio,
      specializations,
      consultationModes,
      consultationFee,
      languages,
      consultationDuration,
      preferredMode,
      acceptingPatients,
      profileVisibility,
      id,
    );
  }
}
