import { Module } from '@nestjs/common';
import { AuthResolver } from './resolvers/auth/auth.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from '../types/user/user.model';
import { UserSchema } from 'src/frameworks/database/schemas/user/user.schema';
import { AuthService } from 'src/frameworks/services/auth.service';
import { MailService } from 'src/frameworks/services/mail.service';
import { AuthUseCase } from 'src/application/use-cases/auth.usecase';
import { JwtSharedModule } from 'src/frameworks/modules/jwt.module';
import { UserUseCase } from 'src/application/use-cases/user.usecase';
import { MongoAuthRepository } from '../../frameworks/database/repositories/mongo.auth.repository';
import { MongoUserRepository } from 'src/frameworks/database/repositories/mongo.user.repository';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { LoggerModule } from 'src/frameworks/graphQL/logger.module';
import { DoctorSchema } from 'src/frameworks/database/schemas/doctor/doctor.schema';
import { Doctor } from 'src/frameworks/database/schemas/doctor/doctor.schema';
import { UserResolver } from './resolvers/user/user.resolver';
import { MongoDoctorRepository } from 'src/frameworks/database/repositories/mongo.doctor.repository';
import { DoctoResolver } from './resolvers/doctor/doctor.resolver';
import { DoctorUseCase } from 'src/application/use-cases/doctor.usecase';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: Doctor.name, schema: DoctorSchema }]),
    JwtSharedModule,
    LoggerModule
  ],
  providers: [
    AuthResolver,
    UserResolver,
    MailService,
    AuthUseCase,
    UserUseCase,
    DoctoResolver,
    JwtAuthGuard,
    DoctorUseCase,
    {
      provide: 'IAuthRepository',
      useClass: MongoAuthRepository,
    },
    {
      provide: 'IAuthService',
      useClass: AuthService,
    },
    {
      provide: 'IUserRepository',
      useClass: MongoUserRepository,
    },
    {
      provide: 'IDoctorRepository',
      useClass: MongoDoctorRepository
    }
  ],
})
export class GraphqlAdaptersModule { }
