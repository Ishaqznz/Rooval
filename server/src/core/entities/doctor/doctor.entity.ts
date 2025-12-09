import { IDoctorOnboard } from "src/core/interfaces/doctor/onboard.interface";
import { DoctorEmailVO } from "src/core/valueOfObjects/doctor/doctor-email";
import { DoctorFullNameVO } from "src/core/valueOfObjects/doctor/doctor-name.vo";
import { DoctorPasswordVO } from "src/core/valueOfObjects/doctor/doctor-password";

export class Doctor {
  constructor(
    public fullName: string,
    public email: string,
    public status: string,
    public role: string,
    public password: string,
    public onboarding: IDoctorOnboard,
    public profilePhoto: string,
    public certificates: string[],
    public id?: string,
  ) {}

  static create(
    fullName: string, 
    email: string, 
    status: string, 
    role: string, 
    password: string, 
    onboarding: IDoctorOnboard,
    profilePhoto: string,
    certificates: string[],
    id?: string
  ): { ok: true, value: Doctor } | { ok: false, error: string } {
    const fullNameResult = DoctorFullNameVO.create(fullName);
    if (fullNameResult.ok == false) return { ok: false, error: fullNameResult.error };
    
    const emailResult = DoctorEmailVO.create(email);
    if (emailResult.ok == false) return { ok: false, error: emailResult.error };
    
    const passwordResult = DoctorPasswordVO.create(password);
    if (passwordResult.ok == false) return { ok: false, error: passwordResult.error };
    
    const doctor = new Doctor(
      fullName,
      email,
      status,
      role ?? 'doctor',
      password,
      onboarding,
      profilePhoto,
      certificates,
      id
    )

    return { ok: true, value: doctor }
  }
}
