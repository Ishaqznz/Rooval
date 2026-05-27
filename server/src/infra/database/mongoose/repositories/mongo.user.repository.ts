import { Injectable } from '@nestjs/common';
import { IUserRepository } from 'src/core/repositories/user.repository.interface';
import { InjectModel } from '@nestjs/mongoose';
import { MongoUserSchema, UserDocument } from '../schemas/user/user.schema';
import mongoose, { Model } from 'mongoose';
import { BusinessRuleViolationError } from 'src/core/errors/businessRule.error';
import { UserMapper } from '../mapper/user.mapper';
import { User } from 'src/core/entities/user/user.entity';
import { IMongoUserDocument } from '../interfaces/documents/mongo.user.document';
import { UserErrorType } from 'src/core/enums/user/user.enums';
import { UserQueryParams } from 'src/core/entities/user/userQueryParams.entity';
import { CountUsers } from 'src/core/entities/user/countUsers.entity';
import { ProfilePhoto } from 'src/core/entities/user/profilePhoto.entity';
import { Types } from 'mongoose';
import { UserProfileUpdate } from 'src/core/entities/user/updateProfile.entity';
import { FilterQuery } from 'mongoose';
import { UpdateQuery } from 'mongoose';
import { StatusFilter, SortField, SortOrder, RoleFilter, AuthFilter } from 'src/core/enums/user/user.enums';
import { RoleEntity } from 'src/core/entities/user/role.entity';
import { DoctorDocument, MongoDoctorSchema } from '../schemas/doctor/doctor.schema';
import { Role } from 'src/core/enums/user/role.enum';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    @InjectModel(MongoUserSchema.name) 
    private _userModel: Model<UserDocument>,
    @InjectModel(MongoDoctorSchema.name)
    private _doctorModel: Model<DoctorDocument>,
  ) { }

  async findUsers(input: UserQueryParams): Promise<User[]> {
    const {
      search,
      filter,
      role,
      authMethod,
      sortBy,
      sortOrder,
      skip,
      limit
    } = input;

    const query: FilterQuery<UserDocument> = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (filter === StatusFilter.ACTIVE) {
      query.isBlocked = false;
    } else if (filter === StatusFilter.BLOCKED) {
      query.isBlocked = true;
    }

    if (role === RoleFilter.ADMIN) {
      query.isAdmin = true;
    } else if (role === RoleFilter.USER) {
      query.isAdmin = false;
    }

    if (authMethod === AuthFilter.GOOGLE) {
      query.googleId = { $exists: true, $ne: null };
    } else if (authMethod === AuthFilter.PASSWORD) {
      query.password = { $exists: true, $ne: null };
    }

    const sort: Record<string, 1 | -1> = {};

    if (sortBy) {
      const fieldMap = {
        [SortField.FULLNAME]: "fullName",
        [SortField.EMAIL]: "email",
        [SortField.CREATEDAT]: "createdAt"
      };

      const order = sortOrder === SortOrder.ASC ? 1 : -1;

      sort[fieldMap[sortBy]] = order;
    } else {
      sort["createdAt"] = -1;
    }

    const users = await this._userModel
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean<IMongoUserDocument[]>();

    const mappedUsers = users
      .map((user) => UserMapper.toUserEntity(user))
      .filter((u) => typeof u !== "string") as User[];

    return mappedUsers;
  }

  async findAllUsers(): Promise<User[]> {
    const users = await this._userModel.find().lean<IMongoUserDocument[]>();
    return UserMapper.toUserEntities(users)
  }

  async countUsers(input: CountUsers): Promise<number> {
    const query: FilterQuery<UserDocument> = {};

    if (input.search && input.search.trim() !== "") {
      query.$or = [
        { fullName: { $regex: input.search, $options: "i" } },
        { email: { $regex: input.search, $options: "i" } }
      ];
    }

    if (input.status && input.status !== "all") {
      query.isBlocked = input.status == 'active' ? false : true;
    }

    return await this._userModel.countDocuments(query);
  }

  async findById(userId: string): Promise<User> {
    const user = await this._userModel.findById(userId).lean<IMongoUserDocument>();
    if (!user) {
      throw new BusinessRuleViolationError(UserErrorType.UserDoesNotExist);
    }
    const MappedUserData = UserMapper.toUserEntity(user);
    if (typeof MappedUserData == 'string') throw new BusinessRuleViolationError(MappedUserData)
    return MappedUserData;
  }

  async findByIds(userIds: string[]): Promise<User[]> {
    const ObjectIds = userIds.map((id) => new mongoose.Types.ObjectId(id))
    const users = await this._userModel.find({ _id: { $in: ObjectIds } }).lean<IMongoUserDocument[]>();
    if (!users) throw new BusinessRuleViolationError(UserErrorType.UserDoesNotExist)
    return UserMapper.toUserEntities(users);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this._userModel.findOne({ email }).lean<IMongoUserDocument>();
    if (!user) return;
    const MappedUserData = UserMapper.toUserEntity(user);
    if (typeof MappedUserData == 'string') throw new BusinessRuleViolationError(MappedUserData)
    return MappedUserData;
  }

  async updateStatus(userId: string, status: boolean): Promise<boolean> {
    const user = await this._userModel.findByIdAndUpdate(userId, { isBlocked: status })
    if (!user) throw new BusinessRuleViolationError(UserErrorType.UserNotFound)
    return true
  }

  async deleteUser(userId: string): Promise<boolean> {
    const user = await this._userModel.findByIdAndDelete(userId)
    if (!user) throw new BusinessRuleViolationError(UserErrorType.UserNotFound)
    return true;
  }

  async updateProfilePhoto(input: ProfilePhoto): Promise<string> {
    const update = await this._userModel.updateOne({ _id: new Types.ObjectId(input.userId) }, {
      $set: { 'profile.personal.profilePhoto': input.profilePhoto }
    })
    return update ? input.profilePhoto : null;
  }

  async updateProfile(entity: UserProfileUpdate): Promise<boolean> {
    const updatePayload: UpdateQuery<UserDocument> = {};

    if (entity.fullName !== undefined) {
      updatePayload['fullName'] = entity.fullName;
    }

    if (entity.address !== undefined) {
      updatePayload['profile.personal.address'] = entity.address;
    }

    if (entity.gender !== undefined) {
      updatePayload['profile.personal.gender'] = entity.gender;
    }

    if (entity.phoneNumber !== undefined) {
      updatePayload['profile.personal.phoneNumber'] = entity.phoneNumber;
    }

    if (entity.allergies !== undefined) {
      updatePayload['profile.health.allergies'] = entity.allergies;
    }

    if (entity.currentMedication !== undefined) {
      updatePayload['profile.health.currentMedication'] = entity.currentMedication;
    }

    if (entity.preferredLanguage !== undefined) {
      updatePayload['profile.health.preferredLanguage'] = entity.preferredLanguage;
    }
    if (Object.keys(updatePayload).length === 0) {
      return false;
    }

    const result = await this._userModel.updateOne(
      { _id: entity.userId },
      { $set: updatePayload }
    );

    return result.modifiedCount > 0;
  }

  async findRoleById(id: string): Promise<RoleEntity> {
    console.log('the id in the findByRoleId: ', id)
    const user = await this._userModel.findById(new mongoose.Types.ObjectId(id));
    console.log('the user in the findRoleById: ', user)

    if (user) {
      return RoleEntity.create(Role.USER)
    }

    const doctor = await this._doctorModel.findById(new mongoose.Types.ObjectId(id));
    console.log('the doctor in the findRoleById: ', doctor)

    if (doctor) {
      return RoleEntity.create(Role.DOCTOR)
    }

    throw new Error(UserErrorType.ROLE_NOT_FOUND);
  }

  async findAdminId(): Promise<string | null> {
    const admin = await this._userModel.findOne({ isAdmin: true })
      .lean<IMongoUserDocument>();
    if (!admin) return null;
    return admin._id.toString()
  }
}