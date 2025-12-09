import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IAuthRepository } from 'src/core/repositories/auth.repository.interface.';
import { User } from 'src/core/entities/user/user.entity';
import { MongoUserSchema, UserDocument } from '../schemas/user/user.schema';
import mongoose, { Model } from 'mongoose';
import { UserMapper } from '../mapper/user.mapper';
import { BusinessRuleViolationError } from 'src/core/errors/business-rule.error';
import { AuthMongoService } from '../services/mongo.auth.service';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import * as dotenv from 'dotenv';
import { DoctorDocument } from '../schemas/doctor/doctor.schema';
import { MongoDoctorSchema } from '../schemas/doctor/doctor.schema';
import { Doctor } from 'src/core/entities/doctor/doctor.entity';
import { IMongoUserDocument } from '../interfaces/documents/mongo.user.model';
import { DoctorMapper } from '../mapper/doctor.mapper';
import { IMongoDoctorDocument } from '../interfaces/documents/mongo.doctor.model';
import { AuthErrorType } from 'src/core/enums/auth.enums';
import { GoogleLogin } from 'src/core/entities/user/googleLogin.entity';
import { IMailService } from 'src/application/services/mail.service.interface';
import { IAuthService } from 'src/application/services/auth.service.interface';
import { UserErrorType } from 'src/core/enums/user.enums';


dotenv.config();

@Injectable()
export class MongoAuthRepository implements IAuthRepository {
  constructor(
    @InjectModel(MongoUserSchema.name) private readonly _userModel: Model<UserDocument>,
    @InjectModel(MongoDoctorSchema.name) private readonly _doctorDocument: Model<DoctorDocument>,
    @InjectRedis() private readonly _redis: Redis,
    @Inject('IMailService') private readonly _mailService: IMailService,
    @Inject('IAuthService') private readonly _authService: IAuthService
  ) { }

  async createUser(data: User): Promise<User> {
    const token = AuthMongoService.generateToken();

    const userData = {
      _id: new mongoose.Types.ObjectId(),
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      isBlocked: false,
      isAdmin: false,
      password: data.password,
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0
    }

    await this._redis.set(
      token,
      JSON.stringify(userData),
    );

    await this._mailService.sendOtpMail(data.email, token);
    await this._redis.expire(token, Number(process.env.REDIS_EXPIRY));
    const userEntity = UserMapper.toUserEntity(userData)
    if (typeof userEntity == 'string') throw new BusinessRuleViolationError(userEntity)
    return userEntity
  }


  async userExists(email: string): Promise<boolean> {
    const findUser = await this._userModel.findOne({ email });
    if (!findUser) return false;
    return true;
  }

  async verifyEmail(token: string): Promise<User | Doctor> {
    const redisUserData = await this._redis.get(token);

    if (!redisUserData)
      throw new BusinessRuleViolationError(
        AuthErrorType.EmailVerificationExpiry,
      );

    const userData = JSON.parse(redisUserData);

    const roleConfig = {
      user: {
        model: this._userModel,
        mapper: UserMapper.toUserEntity,
      },
      doctor: {
        model: this._doctorDocument,
        mapper: DoctorMapper.toDoctorEntity,
      },
    } as const;

    const selected = roleConfig[userData.role];

    if (!selected) {
      throw new BusinessRuleViolationError(
        `Invalid role: ${userData.role}`
      );
    }

    const Model = selected.model;
    const mapper = selected.mapper;

    const newUser = new Model({
      fullName: userData.fullName,
      email: userData.email,
      password: userData.password,
    });

    const userMongoData = await newUser.save();
    const plainObject = userMongoData.toObject();

    const entity = mapper(plainObject);

    if (typeof entity === "string")
      throw new BusinessRuleViolationError(entity);

    return entity;
  }


  async forgotPassword(email: string): Promise<boolean> {
    const token = AuthMongoService.generateToken();
    const userData = await this._userModel.findOne({ email });
    const doctorData = await this._doctorDocument.findOne({ email })

    if (!userData && !doctorData) {
      throw new BusinessRuleViolationError(UserErrorType.NoAccountFound);
    }

    await this._mailService.sendForgotPasswordOtpMail(email, token);

    const account = userData ?? doctorData

    await this._redis.set(
      token,
      JSON.stringify({
        id: account.id,
        fullName: account.fullName,
        email: account.email,
        password: account.password,
      })
    );

    return true;
  }

  async verifyResetToken(token: string): Promise<User> {
    const userString = await this._redis.get(token);

    if (userString === null || userString === undefined) {
      throw new BusinessRuleViolationError(AuthErrorType.TokenExpiry);
    }

    const userData = JSON.parse(userString);

    await this._redis.del(token);

    return userData;
  }

  async resetPassword(password: string, userId: string): Promise<User | Doctor> {

    const updatedUser = await this._userModel
      .findByIdAndUpdate(userId, { password }, { new: true })
      .lean<IMongoUserDocument>();

    if (updatedUser !== null && updatedUser !== undefined) {
      const mappedUser = UserMapper.toUserEntity(updatedUser);

      if (typeof mappedUser === "string") {
        throw new BusinessRuleViolationError(mappedUser);
      }

      return mappedUser;
    }

    const updatedDoctor = await this._doctorDocument
      .findByIdAndUpdate(userId, { password }, { new: true })
      .lean<IMongoDoctorDocument>();

    if (updatedDoctor === null || updatedDoctor === undefined) {
      throw new BusinessRuleViolationError("User or Doctor not found");
    }

    const mappedDoctor = DoctorMapper.toDoctorEntity(updatedDoctor);

    if (typeof mappedDoctor === "string") {
      throw new BusinessRuleViolationError(mappedDoctor);
    }

    return mappedDoctor;
  }

  async googleLogin(data: GoogleLogin): Promise<User | Doctor> {
    const doctor = await this._doctorDocument.findOne({ email: data.email })
    if (doctor) {
      return DoctorMapper.toDoctorEntity(doctor as unknown as IMongoDoctorDocument)
    }

    const userExists = await this._userModel.findOne({ email: data.email })
    if (userExists) {
      const entity = UserMapper.toUserEntity(userExists as unknown as IMongoUserDocument)
      if (typeof entity == 'string') throw new BusinessRuleViolationError(entity)
      return entity
    }

    const Model = data.role === 'user' ? this._userModel : this._doctorDocument;
    const user = new Model({
      fullName: data.fullName,
      email: data.email,
      gooleId: data.googleId,
      password: await this._authService.hashPassword(AuthMongoService.generateToken())
    })

    const userMongoData = await user.save();
    const plainUser = userMongoData.toObject()
    if (data.role == 'doctor') {
      return DoctorMapper.toDoctorEntity(plainUser as unknown as IMongoDoctorDocument)
    }
    const entity = UserMapper.toUserEntity(plainUser as unknown as IMongoUserDocument)
    if (typeof entity == 'string') throw new BusinessRuleViolationError(entity)
    return entity
  }
}