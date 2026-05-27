import { IDoctorProfile } from "src/core/interfaces/doctor/profile.interface";
import { DoctorEmailVO } from "src/core/valueOfObjects/doctor/doctorEmail.vo";
import { DoctorFullNameVO } from "src/core/valueOfObjects/doctor/doctorName.vo";
import { DoctorPasswordVO } from "src/core/valueOfObjects/doctor/doctorPassword.vo";

export class Doctor {
  constructor(
    public fullName: string,
    public email: string,
    public status: string,
    public role: string,
    public password: string,
    public profile: IDoctorProfile,
    public profilePhoto: string,
    public certificates: string[],
    public id: string, // changed to optinal to require
  ) {}

  static create(
    fullName: string, 
    email: string, 
    status: string, 
    role: string, 
    password: string, 
    profile: IDoctorProfile,
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
      profile,
      profilePhoto,
      certificates,
      id
    )

    return { ok: true, value: doctor }
  }
}
