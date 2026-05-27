import { ObjectId } from "mongoose";
import { IDoctorProfile } from "src/core/interfaces/doctor/profile.interface";

export interface IMongoDoctorDocument {
    _id: ObjectId,
    fullName: string,
    email: string,
    password: string,
    status: string,
    profile: IDoctorProfile
    profilePhoto: string
    certificates: string[]
    createdAt: Date,
    updatedAt: Date,
    __v: number
}