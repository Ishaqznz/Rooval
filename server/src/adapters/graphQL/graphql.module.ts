import { Module } from '@nestjs/common';
import { AuthResolver } from '../resolvers/auth/auth.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoUserSchema, UserSchema } from 'src/frameworks/database/mongoose/schemas/user/user.schema';
import { AuthService } from 'src/frameworks/services/auth.service';
import { MailService } from 'src/frameworks/services/mail.service';
import { AuthUseCase } from 'src/application/use-cases/implementation/auth.usecase';
import { JwtSharedModule } from 'src/frameworks/modules/jwt.module';
import { UserUseCase } from 'src/application/use-cases/implementation/user.usecase';
import { MongoAuthRepository } from '../../frameworks/database/mongoose/repositories/mongo.auth.repository';
import { MongoUserRepository } from 'src/frameworks/database/mongoose/repositories/mongo.user.repository';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { LoggerModule } from 'src/frameworks/graphQL/logger.module';
import { DoctorSchema } from 'src/frameworks/database/mongoose/schemas/doctor/doctor.schema';
import { MongoDoctorSchema } from 'src/frameworks/database/mongoose/schemas/doctor/doctor.schema';
import { UserResolver } from '../resolvers/user/user.resolver';
import { MongoDoctorRepository } from 'src/frameworks/database/mongoose/repositories/mongo.doctor.repository';
import { DoctorResolver } from '../resolvers/doctor/doctor.resolver';
import { DoctorUseCase } from 'src/application/use-cases/implementation/doctor.usecase';
import { CloudinaryService } from 'src/frameworks/services/cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MongoUserSchema.name, schema: UserSchema }, { name: MongoDoctorSchema.name, schema: DoctorSchema }]),
    JwtSharedModule,
    LoggerModule
  ],
  providers: [
    AuthResolver,
    UserResolver,
    MailService,
    AuthUseCase,
    UserUseCase,
    DoctorResolver,
    JwtAuthGuard,
    DoctorUseCase,
    CloudinaryService,
    {
      provide: 'IAuthRepository',
      useClass: MongoAuthRepository,
    },
    {
      provide: 'IAuthService',
      useClass: AuthService,
    },
    {
      provide: 'IMailService',
      useClass: MailService
    },
    {
      provide: 'IUserRepository',
      useClass: MongoUserRepository,
    },
    {
      provide: 'IDoctorRepository',
      useClass: MongoDoctorRepository
    },
    {
      provide: 'IAuthUseCase',
      useClass: AuthUseCase
    },
    {
      provide: 'IDoctorUseCase',
      useClass: DoctorUseCase
    },
    {
      provide: 'IUserUseCase',
      useClass: UserUseCase
    },
    {
      provide: 'ICloudinaryService',
      useClass: CloudinaryService
    }
  ],
})


export class GraphqlAdaptersModule { }
