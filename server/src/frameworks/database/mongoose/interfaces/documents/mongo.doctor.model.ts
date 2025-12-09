import { ObjectId } from "mongoose";
import { IDoctorOnboard } from "src/core/interfaces/doctor/onboard.interface";

export interface IMongoDoctorDocument {
    _id: ObjectId,
    fullName: string,
    email: string,
    password: string,
    status: string,
    onboarding: IDoctorOnboard
    profilePhoto: string
    certificates: string[]
    createdAt: Date,
    updatedAt: Date,
    __v: number
}