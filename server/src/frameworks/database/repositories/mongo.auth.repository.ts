import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IAuthRepository } from 'src/application/repositories/auth/auth.repository.interface.';
import { UserEntity } from 'src/core/entities/user.entity';
import { SignUpOutputDto } from 'src/application/DTO/user/signup/singup.output.dto';
import { LoginInputDto } from 'src/application/DTO/user/login/login.input.dto';
import { User, UserDocument } from '../schemas/user/user.schema';
import { Model } from 'mongoose';
import { AuthMapper } from '../mapper/auth.mapper';
import { BusinessRuleViolationError } from 'src/core/errors/business-rule.error';
import { AuthMongoService } from '../services/mongo.auth.service';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import * as dotenv from 'dotenv';
import { MailService } from 'src/frameworks/services/mail.service';
import { PasswordInputDto } from 'src/application/DTO/user/forgotPassword/forgot-passwords.input.dto';
import { DoctorDocument } from '../schemas/doctor/doctor.schema';
import { Doctor } from '../schemas/doctor/doctor.schema';

dotenv.config();

@Injectable()
export class MongoAuthRepository implements IAuthRepository {
  constructor(
    @InjectModel(User.name) private readonly _userModel: Model<UserDocument>,
    @InjectModel(Doctor.name) private readonly _doctorDocument: Model<DoctorDocument>,
    @InjectRedis() private readonly _redis: Redis,
    private readonly _mailService: MailService,
  ) { }

  async findUsers(): Promise<SignUpOutputDto[]> {
    const users = await this._userModel.find();
    const usersData = AuthMapper.toGetAllUsersDto(users);
    return usersData;
  }

  async createUser(data: UserEntity): Promise<SignUpOutputDto> {
    const token = AuthMongoService.generateToken();
    await this._redis.set(
      token,
      JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        password: data.password,
      }),
    );
    await this._mailService.sendOtpMail(data.email, token);
    await this._redis.expire(token, Number(process.env.REDIS_EXPIRY));
    const userTempData = {
      id: '0',
      fullName: data.fullName,
      email: data.email,
      isBlocked: false,
      isAdmin: false,
      password: data.password,
    };
    return userTempData;
  }

  async loginUser(data: LoginInputDto): Promise<SignUpOutputDto> {
    if (true) {
      return {
        id: '2',
        fullName: 'Ishaq',
        email: data.email,
        isBlocked: false,
        isAdmin: false,
        password: data.password,
      };
    }
  }

  async userExists(email: string): Promise<boolean> {
    const findUser = await this._userModel.findOne({ email });
    if (!findUser) return false;
    return true;
  }

  async verifyEmail(token: string): Promise<SignUpOutputDto> {
    const redixUserData = await this._redis.get(token);

    if (!redixUserData)
      throw new BusinessRuleViolationError(
        'Email verification link is expired!',
      );

    const userData = JSON.parse(redixUserData);
    const Model = userData.role === "doctor" ? this._doctorDocument : this._userModel;

    const newUser = new Model({
      fullName: userData.fullName,
      email: userData.email,
      password: userData.password,
    });

    const userMongoData = await newUser.save();
    await this._redis.del(token);

    const mappedUser = AuthMapper.toUserDto(userMongoData);
    return mappedUser;
  }

  async forgotPassword(data: PasswordInputDto): Promise<boolean> {
    const token = AuthMongoService.generateToken();
    const userData = await this._userModel.findOne({ email: data.email });
    await this._mailService.sendForgotPasswordOtpMail(userData.email, token);
    await this._redis.set(
      token,
      JSON.stringify({
        id: userData.id,
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
      }),
    );
    return true;
  }

  async verifyResetToken(token: string): Promise<SignUpOutputDto> {
    const user = await this._redis.get(token);
    if (!user) throw new BusinessRuleViolationError('Token expired!');
    const userData = JSON.parse(user);
    await this._redis.del(token);
    return userData;
  }

  async resetPassword(
    password: string,
    userId: string,
  ): Promise<SignUpOutputDto> {
    const updatedUserData = await this._userModel.findByIdAndUpdate(userId, {
      password,
    });
    const mappedUser = AuthMapper.toUserDto(updatedUserData);
    return mappedUser;
  }
}
