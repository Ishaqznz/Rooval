import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusinessRuleViolationError } from 'src/core/errors/business-rule.error';
import { IDoctorRepository } from 'src/core/repositories/doctor.repository.interface';
import { MongoDoctorSchema, DoctorDocument } from '../schemas/doctor/doctor.schema';
import { DoctorMapper } from '../mapper/doctor.mapper';
import { Doctor } from 'src/core/entities/doctor/doctor.entity';
import { IMongoDoctorDocument } from '../interfaces/documents/mongo.doctor.model';
import { DoctorErrorType } from 'src/core/enums/doctor.enums';
import { DoctorOnboarding } from 'src/core/entities/doctor/onboarding.entity';
import { Types } from "mongoose";
import { FileUpload } from 'src/core/entities/doctor/fileupload.entity';
import { FileReUpload } from 'src/core/entities/doctor/file-reupload.entity';
import { DoctorQueryParams } from 'src/core/entities/doctor/doctorQueryParams.entity';
import { CountDoctors } from 'src/core/entities/doctor/countDoctors.entity';
import { FilterQuery } from "mongoose";
import { UserErrorType } from 'src/core/enums/user.enums';


@Injectable()
export class MongoDoctorRepository implements IDoctorRepository {
    constructor(
        @InjectModel(MongoDoctorSchema.name) private _doctorModel: Model<DoctorDocument>,
    ) { }

    async findDoctors(input: DoctorQueryParams): Promise<Doctor[]> {
        const { search, filter, skip, limit } = input;
        const query: FilterQuery<IMongoDoctorDocument> = {};

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        if (filter && filter !== "all") {
            query.status = filter;
        }

        const doctors = await this._doctorModel
            .find(query)
            .skip(skip)
            .limit(limit)
            .lean<IMongoDoctorDocument[]>();

        const mappedDoctors = DoctorMapper
            .toDoctorEntities(doctors)
            .filter((d) => typeof d !== "string") as Doctor[];

        return mappedDoctors;
    }

    async countDoctors(input: CountDoctors): Promise<number> {
        const query: FilterQuery<IMongoDoctorDocument> = {};

        if (input.search && input.search.trim() !== "") {
            query.$or = [
                { fullName: { $regex: input.search, $options: "i" } },
                { email: { $regex: input.search, $options: "i" } }
            ];
        }

        if (input.status && input.status !== "all") {
            query.status = input.status;
        }

        return await this._doctorModel.countDocuments(query);
    }

    async findByEmail(email: string): Promise<Doctor> {
        const doctor = await this._doctorModel.findOne({ email }).lean<IMongoDoctorDocument>()
        if (!doctor) return;
        const mappedDoctor = DoctorMapper.toDoctorEntity(doctor)
        return mappedDoctor
    }

    async findById(id: string): Promise<Doctor> {
        const doctor = await this._doctorModel.findById(id).lean<IMongoDoctorDocument>();
        if (!doctor) throw new BusinessRuleViolationError(DoctorErrorType.DoctorNotFound)
        const mappedDoctor = DoctorMapper.toDoctorEntity(doctor)
        return mappedDoctor;
    }

    async findByUsername(username: string): Promise<Doctor> {
        const doctor = await this._doctorModel.findOne({ "onboarding.username": username }).lean<IMongoDoctorDocument>();
        if (!doctor) {
            throw new Error(DoctorErrorType.DoctorNotFound)
        }
        return DoctorMapper.toDoctorEntity(doctor)
    }

    async changeDoctorStatus(userId: string, status: string): Promise<boolean> {
        const doctor = await this._doctorModel.findByIdAndUpdate(userId, { status })
        if (!doctor) throw new BusinessRuleViolationError(DoctorErrorType.DoctorIsNotExisted)
        return true
    }

    async deleteDoctor(userId: string): Promise<boolean> {
        const doctor = await this._doctorModel.findByIdAndDelete(userId)
        if (!doctor) throw new BusinessRuleViolationError(DoctorErrorType.DoctorNotFound)
        return true
    }

    async addOnboarding(onboardingData: DoctorOnboarding): Promise<boolean> {
        console.log('the ide of the doctor: ', onboardingData.id)
        console.log('the onboarding data in the framework layer: ', onboardingData)
        const result = await this._doctorModel.updateOne(
            { _id: new Types.ObjectId(onboardingData.id) },
            {
                $set: {
                    onboarding: {
                        username: onboardingData.username,
                        gender: onboardingData.gender,
                        phone: onboardingData.phone,
                        registrationNumber: onboardingData.registrationNumber,
                        country: onboardingData.country,
                        state: onboardingData.state,
                        experience: onboardingData.experience,
                        bio: onboardingData.bio,
                        specializations: onboardingData.specializations,
                        consultationModes: onboardingData.consultationModes,
                        consultationFee: onboardingData.consultationFee,
                        languages: onboardingData.languages,
                        consultationDuration: onboardingData.consultationDuration,
                        preferredMode: onboardingData.preferredMode,
                        acceptingPatients: onboardingData.acceptingPatients,
                        profileVisibility: onboardingData.profileVisibility,
                    },
                },
            }
        );

        console.log('the result: ', result)
        return result.modifiedCount > 0;
    }

    async doctorFileUpload(files: FileUpload): Promise<boolean> {
        const result = await this._doctorModel.updateOne(
            { _id: new Types.ObjectId(files.doctorId) },
            {
                $set: {
                    profilePhoto: files.profilePhoto,
                    certificates: files.certificates
                },
            }
        );

        return result.modifiedCount > 0
    }

    async doctorFileReUpload(files: FileReUpload): Promise<boolean> {
        console.log('the uploaded files: ', files)
        const result = await this._doctorModel.updateOne(
            { _id: new Types.ObjectId(files.doctorId) },
            {
                $set: {
                    status: 'pending',
                    certificates: files.certificates
                },
            }
        );

        return result.modifiedCount > 0
    }

    async addRejectionReason(doctorId: string, reason: string): Promise<boolean> {
        console.log('the doctorId and the reason: ', doctorId, reason)
        const update = await this._doctorModel.updateOne(
            { _id: new Types.ObjectId(doctorId) },
            {
                $set: {
                    "onboarding.rejectionReason": reason
                }
            }
        );
        return update.modifiedCount > 0;
    }
}