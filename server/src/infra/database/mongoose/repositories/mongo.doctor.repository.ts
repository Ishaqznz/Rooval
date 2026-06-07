import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { BusinessRuleViolationError } from 'src/core/errors/businessRule.error';
import { IDoctorRepository } from 'src/core/repositories/doctor.repository.interface';
import { MongoDoctorSchema, DoctorDocument } from '../schemas/doctor/doctor.schema';
import { DoctorMapper } from '../mapper/doctor.mapper';
import { Doctor } from 'src/core/entities/doctor/profile/doctor.entity';
import { IMongoDoctorDocument } from '../interfaces/documents/mongo.doctor.document';
import { DoctorErrorType, DoctorSortBy } from 'src/core/enums/doctor/doctor.enums';
import { DoctorOnboarding } from 'src/core/entities/doctor/profile/onboarding.entity';
import { Types } from "mongoose";
import { FileUpload } from 'src/core/entities/doctor/profile/fileupload.entity';
import { FileReUpload } from 'src/core/entities/doctor/profile/file-reupload.entity';
import { DoctorQueryParams } from 'src/core/entities/doctor/profile/doctorQueryParams.entity';
import { CountDoctors } from 'src/core/entities/doctor/profile/countDoctors.entity';
import { FilterQuery, SortOrder } from "mongoose";
import { DoctorProfileUpdate } from 'src/core/entities/doctor/profile/updateProfile.entity';
import { ChangeDoctorPassord } from 'src/core/entities/doctor/profile/changeDoctorPassword.entity';
import { ListDoctors } from 'src/core/entities/doctor/profile/listDoctors.entity';
import { OrderBy } from 'src/core/enums/doctor/doctor.enums';
import { UpdateQuery } from 'mongoose';
import { ListDoctorsPayload } from 'src/core/entities/doctor/profile/listDoctorsPayload.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { LoggerService } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IsChatEnabled } from 'src/core/entities/user/isChatEnabled.entity';
import { GrantChatAccess } from 'src/core/entities/doctor/profile/grantChatAccess.entity';
import { RemoveChatAccess } from 'src/core/entities/doctor/profile/removeChatAccess.entity';

@Injectable()
export class MongoDoctorRepository implements IDoctorRepository {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly _logger: LoggerService,
        @InjectModel(MongoDoctorSchema.name)
        private _doctorModel: Model<DoctorDocument>,
    ) { }

    async findDoctors(input: DoctorQueryParams): Promise<Doctor[]> {
        const {
            search,
            filter,
            specialization,
            consultationMode,
            minExperience,
            maxExperience,
            sortBy,
            sortOrder,
            skip,
            limit,
        } = input;

        const query: FilterQuery<IMongoDoctorDocument> = {};

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        if (filter && filter !== "all") {
            query.status = filter;
        }

        if (specialization) {
            query["profile.personal.specializations"] = {
                $in: [specialization],
            };
        }

        if (consultationMode && consultationMode !== "all") {
            query["profile.consultationSettings.consultationModes"] = {
                $in: [consultationMode],
            };
        }

        if (minExperience || maxExperience) {
            query["profile.personal.experience"] = {};

            if (minExperience) {
                query["profile.personal.experience"].$gte = minExperience;
            }

            if (maxExperience) {
                query["profile.personal.experience"].$lte = maxExperience;
            }
        }

        const sort: Record<string, 1 | -1> = {};

        if (sortBy) {
            const order = sortOrder === "asc" ? 1 : -1;

            switch (sortBy) {
                case "fullName":
                    sort.fullName = order;
                    break;
                case "email":
                    sort.email = order;
                    break;
                case "createdAt":
                    sort.createdAt = order;
                    break;
                case "experience":
                    sort["profile.personal.experience"] = order;
                    break;
            }
        }

        const doctors = await this._doctorModel
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean<IMongoDoctorDocument[]>();

        const mappedDoctors = DoctorMapper
            .toDoctorEntities(doctors)
            .filter((d) => typeof d !== "string") as Doctor[];

        return mappedDoctors;
    }

    async findAllDoctors(): Promise<Doctor[]> {
        const doctors = await this._doctorModel.find().lean<IMongoDoctorDocument[]>();
        return DoctorMapper.toDoctorEntities(doctors)
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

    async addOnboarding(data: DoctorOnboarding): Promise<boolean> {
        const result = await this._doctorModel.updateOne(
            { _id: new Types.ObjectId(data.id) },
            {
                $set: {
                    profile: {
                        personal: {
                            username: data.username,
                            gender: data.gender,
                            phone: data.phone,
                            country: data.country,
                            state: data.state,
                            experience: data.experience,
                            bio: data.bio,
                            specializations: data.specializations,
                            languages: data.languages,
                            registrationNumber: data.registrationNumber,
                            preferredMode: data.preferredMode,
                            profileVisibility: data.profileVisibility,
                        },
                        clinic: {
                            name: "",
                            address: "",
                            phoneNumber: "",
                            country: "",
                            workingDays: "",
                        },
                        consultationSettings: {
                            type: "",
                            consultationModes: [data.consultationModes[0]],
                            consultationFee: data.consultationFee,
                            inPersonFee: 0,
                            videoFee: data.consultationFee,
                            duration: data.consultationDuration,
                            sessionBufferTime: "",
                            cancellationPolicy: "",
                        }
                    }
                }
            }
        );

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
        const update = await this._doctorModel.updateOne(
            { _id: new Types.ObjectId(doctorId) },
            {
                $set: {
                    "profile.personal.rejectionReason": reason
                }
            }
        );
        return update.modifiedCount > 0;
    }

    async updateProfile(id: string, entity: DoctorProfileUpdate): Promise<boolean> {
        console.log('update profile input: ', entity, entity?.consultationSettings)
        const updateData: UpdateQuery<DoctorDocument> = {};
        if (entity.fullName) updateData["fullName"] = entity.fullName;
        if (entity.phoneNumber) updateData["profile.personal.phone"] = entity.phoneNumber;
        if (entity.registrationNumber) updateData["profile.personal.registrationNumber"] = entity.registrationNumber;
        if (entity.bio) updateData["profile.personal.bio"] = entity.bio;

        if (entity.clinic) {
            if (entity.clinic.name) updateData["profile.clinic.name"] = entity.clinic.name;
            if (entity.clinic.address) updateData["profile.clinic.address"] = entity.clinic.address;
            if (entity.clinic.phoneNumber) updateData["profile.clinic.phoneNumber"] = entity.clinic.phoneNumber;
            if (entity.clinic.country) updateData["profile.clinic.country"] = entity.clinic.country;
            if (entity.clinic.workingDays) updateData["profile.clinic.workingDays"] = entity.clinic.workingDays;
        }

        if (entity.consultationSettings) {
            if (entity.consultationSettings.type) updateData["profile.consultationSettings.type"] = entity.consultationSettings.type;
            if (entity.consultationSettings.inPersonFee) updateData["profile.consultationSettings.inPersonFee"] = entity.consultationSettings.inPersonFee;
            if (entity.consultationSettings.videoFee) updateData["profile.consultationSettings.videoFee"] = entity.consultationSettings.videoFee;
            if (entity.consultationSettings.duration) updateData["profile.consultationSettings.duration"] = Number(entity.consultationSettings.duration);
            if (entity.consultationSettings.sessionBufferTime) updateData["profile.consultationSettings.sessionBufferTime"] = Number(entity.consultationSettings.sessionBufferTime);
            if (entity.consultationSettings.cancellationPolicy) updateData["profile.consultationSettings.cancellationPolicy"] = entity.consultationSettings.cancellationPolicy;
        }

        const updateProfile = await this._doctorModel.updateOne(
            { _id: new Types.ObjectId(id) },
            { $set: updateData }
        );
        return updateProfile.modifiedCount > 0;
    }

    async changePassword(entitity: ChangeDoctorPassord): Promise<boolean> {
        const updatePassword = await this._doctorModel.findByIdAndUpdate(entitity.userId, {
            password: entitity.password
        })
        return !!updatePassword;
    }

    async listDoctors(entity: ListDoctors): Promise<ListDoctorsPayload[]> {
        const { pagination, sorting, filter } = entity;
        const query: FilterQuery<DoctorDocument> = {};
        const andConditions: FilterQuery<DoctorDocument>[] = [];

        if (filter?.search) {
            const regex = new RegExp(filter.search, 'i');
            andConditions.push({
                $or: [
                    { fullName: regex },
                    { 'profile.personal.specializations': regex },
                    { 'profile.personal.languages': regex },
                    { 'profile.clinic.name': regex },
                    { 'profile.clinic.address': regex },
                ],
            });
        }

        andConditions.push({
            status: { $nin: ['rejected', 'pending'] }
        });

        if (filter.specialization?.length) {
            query["profile.personal.specializations"] = {
                $in: filter.specialization,
            };
        }

        if (filter.city) {
            query["profile.clinic.address"] = filter.city;
        }

        if (filter.consultationType) {
            query["profile.consultationSettings.consultationModes"] =
                filter.consultationType;
        }

        if (filter.minExperience !== undefined) {
            query["profile.personal.experience"] = {
                $gte: filter.minExperience,
            };
        }

        if (filter.feeRange &&
            (filter.feeRange.minFee !== undefined ||
                filter.feeRange.maxFee !== undefined)
        ) {
            query.$or = [
                {
                    "profile.consultationSettings.consultationFee": {
                        $gte: filter.feeRange.minFee ?? 0,
                        $lte: filter.feeRange.maxFee ?? Number.MAX_SAFE_INTEGER,
                    },
                },
            ]
        }

        let sortField = '';

        switch (sorting.sortBy) {
            case DoctorSortBy.EXPERIENCE:
                sortField = 'profile.personal.experience';
                break;

            case DoctorSortBy.FEE:
                sortField = 'profile.consultationSettings.consultationFee';
                break;

            case DoctorSortBy.RATING:
                sortField = 'rating';
                break;

            default:
                sortField = 'createdAt';
        }

        const sortQuery: { [key: string]: SortOrder } = {
            [sortField]: sorting.order === OrderBy.ASC ? 1 : -1
        };

        if (andConditions.length > 0) {
            query.$and = andConditions;
        }

        const skip =
            (pagination.page.value - 1) * pagination.limit.value;
        console.log('FINAL QUERY:', JSON.stringify(query, null, 2));

        const countDoctors = await this._doctorModel
            .find(query)
            .countDocuments()

        const doctors = await this._doctorModel
            .find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(pagination.limit.value)
            .lean<IMongoDoctorDocument[]>();

        return DoctorMapper.toListDoctorsEntities(doctors, countDoctors)
    }

    async findByIds(ids: string[]): Promise<Doctor[]> {
        const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));

        const doctors = await this._doctorModel.find({
            _id: { $in: objectIds }
        }).lean<IMongoDoctorDocument[]>();

        return DoctorMapper.toDoctorEntities(doctors);
    }

    async isChatEnabled(entity: IsChatEnabled): Promise<boolean> {
        const doctor = await this._doctorModel.findOne({
            _id: new mongoose.Types.ObjectId(entity.input.doctorId),
            'profile.personal.chatEnabledUsers': new mongoose.Types.ObjectId(entity.input.userId)
        });

        return !!doctor;
    }

    async grantChatAccess(entitity: GrantChatAccess): Promise<boolean> {
        const userObjectId = new mongoose.Types.ObjectId(entitity.input.userId)
        const doctorObjectId = new mongoose.Types.ObjectId(entitity.input.doctorId)
        const update = await this._doctorModel.updateOne(
            { _id: doctorObjectId }, {
            $push: {
                'profile.personal.chatEnabledUsers': userObjectId
            }
        })

        return update.modifiedCount > 0;
    }

    async removeChatAccess(entity: RemoveChatAccess): Promise<boolean> {
        const userObjectId = new mongoose.Types.ObjectId(entity.input.userId)
        const doctorObjectId = new mongoose.Types.ObjectId(entity.input.doctorId)
        const update = await this._doctorModel.updateOne(
            { _id: doctorObjectId }, {
            $pull: {
                'profile.personal.chatEnabledUsers': userObjectId
            }
        })

        return update.modifiedCount > 0;
    }
}