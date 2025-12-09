import { Injectable } from '@nestjs/common';
import { IUserRepository } from 'src/core/repositories/user.repository.interface';
import { InjectModel } from '@nestjs/mongoose';
import { MongoUserSchema, UserDocument } from '../schemas/user/user.schema';
import { Model } from 'mongoose';
import { BusinessRuleViolationError } from 'src/core/errors/business-rule.error';
import { UserMapper } from '../mapper/user.mapper';
import { User } from 'src/core/entities/user/user.entity';
import { IMongoUserDocument } from '../interfaces/documents/mongo.user.model';
import { UserErrorType } from 'src/core/enums/user.enums';
import { UserQueryParams } from 'src/core/entities/user/userQueryParams.entity';
import { CountUsers } from 'src/core/entities/user/countUsers.entity';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    @InjectModel(MongoUserSchema.name) private _userModel: Model<UserDocument>,
  ) { }

  async findUsers(input: UserQueryParams): Promise<User[]> {
    const { search, filter, skip, limit } = input;
    const query: any = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (filter === "active") {
      query.isBlocked = false;
    } else if (filter === "blocked") {
      query.isBlocked = true;
    }

    const users = await this._userModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .lean<IMongoUserDocument[]>();

    const mappedUsers = users
      .map((user) => UserMapper.toUserEntity(user))
      .filter((u) => typeof u !== "string") as User[];

    return mappedUsers;
  }

  async countUsers(input: CountUsers): Promise<number> {
    const query: any = {};

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
}
