import { Injectable } from '@nestjs/common';
import { SignUpOutputDto } from 'src/application/DTO/user/signup/singup.output.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user/user.schema';
import { Model } from 'mongoose';
import { BusinessRuleViolationError } from 'src/core/errors/business-rule.error';
import { IDoctorRepository } from 'src/application/repositories/doctor/doctor.repository.interface';
import { AuthMapper } from '../mapper/auth.mapper';
import { Doctor, DoctorDocument } from '../schemas/doctor/doctor.schema';


@Injectable()
export class MongoDoctorRepository implements IDoctorRepository {
   constructor(
    @InjectModel(Doctor.name) private _doctorModel: Model<DoctorDocument>,
   ) { }

   async findAll(): Promise<SignUpOutputDto[]> {
       return await this._doctorModel.find()
   }

   async findByEmail(email: string): Promise<SignUpOutputDto> {
       console.log('email data: ', email)
       return await this._doctorModel.findOne({ email })
   }

   async findById(id: string): Promise<SignUpOutputDto> {
       return await this._doctorModel.findById(id)
   }
}