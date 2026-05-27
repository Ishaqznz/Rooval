import { ObjectId } from "mongodb";
import { IUserProfile } from "src/core/interfaces/user/profile.interface";

export interface IMongoUserDocument {
    _id: ObjectId,
    fullName: string,
    email: string,
    profile?: IUserProfile,
    isBlocked: boolean,
    isAdmin: boolean,
    password: string,
    createdAt: Date,
    updatedAt: Date,
    __v: number
}