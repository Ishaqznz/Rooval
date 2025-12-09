import { ObjectId } from "mongodb";

export interface IMongoUserDocument {
    _id: ObjectId,
    fullName: string,
    email: string,
    isBlocked: boolean,
    isAdmin: boolean,
    password: string,
    createdAt: Date,
    updatedAt: Date,
    __v: number
}