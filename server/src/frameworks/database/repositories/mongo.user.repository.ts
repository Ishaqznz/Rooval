import { Injectable } from '@nestjs/common';
import { SignUpOutputDto } from 'src/application/DTO/user/signup/singup.output.dto';
import { IUserRepository } from 'src/application/repositories/user/user.repository.interface';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user/user.schema';
import { Model } from 'mongoose';
import { BusinessRuleViolationError } from 'src/core/errors/business-rule.error';
import { AuthMapper } from '../mapper/auth.mapper';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    @InjectModel(User.name) private _userModel: Model<UserDocument>,
  ) { }
  async findById(userId: string): Promise<SignUpOutputDto> {
    const user = await this._userModel.findById(userId);
    if (!user) {
      throw new BusinessRuleViolationError('User is not existed!');
    }
    const MappedUserData = AuthMapper.toUserDto(user);
    return MappedUserData;
  }

  async findByEmail(email: string): Promise<SignUpOutputDto> {
    const user = await this._userModel.findOne({ email });
    if (!user) return;
    const MappedUserData = AuthMapper.toUserDto(user);
    return MappedUserData;
  }

  async updateStatus(userId: string, status: boolean) : Promise<boolean> {
    const user = await this._userModel.findByIdAndUpdate(userId, { isBlocked: status })

    if (!user) throw new BusinessRuleViolationError('user not found!') 
    return true
  }

  async deleteUser(userId: string): Promise<boolean> {
    const user = await this._userModel.findByIdAndDelete(userId)
    if (!user) throw new BusinessRuleViolationError('User not found!')
    return true;
  }
}
