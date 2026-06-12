import { Module } from '@nestjs/common';
import { AuthResolver } from 'src/adapters/api/graphql/resolvers/auth/auth.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoUserSchema, UserSchema } from 'src/infra/database/mongoose/schemas/user/user.schema';
import { AuthService } from 'src/infra/services/auth.service';
import { MailService } from 'src/infra/services/mail.service';
import { AuthUseCase } from 'src/application/use-cases/implementation/auth.usecase';
import { JwtSharedModule } from 'src/infra/modules/jwt.module';
import { UserUseCase } from 'src/application/use-cases/implementation/user.usecase';
import { MongoAuthRepository } from 'src/infra/database/mongoose/repositories/mongo.auth.repository';
import { MongoUserRepository } from 'src/infra/database/mongoose/repositories/mongo.user.repository';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { LoggerModule } from 'src/infra/graphql/logger.module';
import { DoctorSchema } from 'src/infra/database/mongoose/schemas/doctor/doctor.schema';
import { MongoDoctorSchema } from 'src/infra/database/mongoose/schemas/doctor/doctor.schema';
import { UserResolver } from 'src/adapters/api/graphql/resolvers/user/user.resolver';
import { MongoDoctorRepository } from 'src/infra/database/mongoose/repositories/mongo.doctor.repository';
import { DoctorResolver } from 'src/adapters/api/graphql/resolvers/doctor/doctor.resolver';
import { DoctorUseCase } from 'src/application/use-cases/implementation/doctor.usecase';
import { CloudinaryService } from 'src/infra/services/cloudinary.service';
import { DoctorService } from 'src/infra/services/doctor.service';
import { DoctorAvailabilityResolver } from 'src/adapters/api/graphql/resolvers/doctor/availability.resolver';
import { AvailabilityUseCase } from 'src/application/use-cases/implementation/availability.usecase';
import { MongoAvailabilityRepository } from 'src/infra/database/mongoose/repositories/mongo.availability.repository';
import { DoctorAvailabilityModel, DoctorAvailabilitySchema } from 'src/infra/database/mongoose/schemas/doctor/availability.schema';
import { AvailabilityLoader } from 'src/adapters/api/graphql/loaders/availability.loader';
import { DoctorAppointmentResolver } from 'src/adapters/api/graphql/resolvers/user/appointment.resolver';
import { AppointmentUseCase } from 'src/application/use-cases/implementation/appointment.usecase';
import { MongoAppointmentRepository } from 'src/infra/database/mongoose/repositories/mongo.appointment.repository';
import { AppointmentModel, AppointmentSchema } from 'src/infra/database/mongoose/schemas/doctor/appointment.schema';
import { TimezoneService } from 'src/infra/services/timezone.service';
import { AppointmentLoader } from 'src/adapters/api/graphql/loaders/appointment.loader';
import { DoctorLoader } from 'src/adapters/api/graphql/loaders/doctor.loader';
import { UserLoader } from 'src/adapters/api/graphql/loaders/user.loader';
import { PaymentResolver } from 'src/adapters/api/graphql/resolvers/user/payment.resolver';
import { PaymentUseCase } from 'src/application/use-cases/implementation/payment.usecase';
import { PaymentService } from 'src/infra/services/payment.service';
import { WebhookController } from 'src/adapters/api/rest/controllers/webhook.controller';
import { WebHookService } from 'src/infra/services/webhook.service';
import { PaymentRepository } from 'src/infra/database/mongoose/repositories/mongo.payment.repository';
import { ChatGateway } from 'src/adapters/socket/gateways/socket.gateway';
import { NotificationResolver } from 'src/adapters/api/graphql/resolvers/user/notification.resolver';
import { NotificationUseCase } from 'src/application/use-cases/implementation/notification.usecase';
import { NotificationRepository } from 'src/infra/database/mongoose/repositories/mongo.notification.repository';
import { MongoNotificationSchema, NotificationSchema } from 'src/infra/database/mongoose/schemas/notification/notification.schema';
import { MessageSchema, MongoMessageSchema } from 'src/infra/database/mongoose/schemas/messages/message.schema';
import { ConversationSchema, MongoConversationSchema } from 'src/infra/database/mongoose/schemas/conversation/conversation.shema';
import { MessageUseCase } from 'src/application/use-cases/implementation/message.usecase';
import { ConversationUseCase } from 'src/application/use-cases/implementation/conversation.usecase';
import { MessageRepository } from 'src/infra/database/mongoose/repositories/mongo.message.repository';
import { ConversationRepository } from 'src/infra/database/mongoose/repositories/mongo.conversation.repository';
import { MessageResolver } from 'src/adapters/api/graphql/resolvers/user/message.resolver';
import { ConversationResolver } from 'src/adapters/api/graphql/resolvers/user/conversation.resolver';
import { NotificationService } from 'src/infra/services/notification.service';
import { NotificationOrchestrator } from 'src/application/orchestrators/implementation/notification.orch';
import { DownloadController } from 'src/adapters/api/rest/controllers/download.controller';
import { SupabaseService } from 'src/infra/services/superbase.service';
import { MongoWalletSchema } from 'src/infra/database/mongoose/schemas/wallet/wallet.schema';
import { MongoWalletTransactionSchema, WalletTransactionSchema } from 'src/infra/database/mongoose/schemas/wallet/walletTransaction.schema';
import { WalletSchema } from 'src/infra/database/mongoose/schemas/wallet/wallet.schema';
import { WalletResolver } from 'src/adapters/api/graphql/resolvers/user/wallet.resolver';
import { WalletUseCase } from 'src/application/use-cases/implementation/wallet.usecase';
import { MongoWalletRepository } from 'src/infra/database/mongoose/repositories/mongo.wallet.repository';
import { MongoWithdrawalRequestSchema, WithdrawalRequestSchema } from 'src/infra/database/mongoose/schemas/wallet/withdrawalRequest.schema';
import { CallGateway } from 'src/adapters/socket/gateways/call.gateway';
import { ReviewsResolver } from 'src/adapters/api/graphql/resolvers/user/reviews.resolver';
import { MongoReviewSchema } from '../database/mongoose/schemas/reviews/reviews.schema';
import { ReviewSchema } from '../database/mongoose/schemas/reviews/reviews.schema';
import { ReviewsUseCase } from 'src/application/use-cases/implementation/reviews.usecase';
import { MongoReviewsRepository } from '../database/mongoose/repositories/mongo.reviews.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MongoUserSchema.name, schema: UserSchema },
      { name: MongoDoctorSchema.name, schema: DoctorSchema },
      { name: DoctorAvailabilitySchema.name, schema: DoctorAvailabilityModel },
      { name: AppointmentSchema.name, schema: AppointmentModel },
      { name: MongoNotificationSchema.name, schema: NotificationSchema },
      { name: MongoMessageSchema.name, schema: MessageSchema }, 
      { name: MongoConversationSchema.name, schema: ConversationSchema },
      { name: MongoWalletSchema.name, schema: WalletSchema }, 
      { name: MongoWalletTransactionSchema.name, schema: WalletTransactionSchema },
      { name: MongoWithdrawalRequestSchema.name, schema: WithdrawalRequestSchema },
      { name: MongoReviewSchema.name, schema: ReviewSchema }
    ]),
    JwtSharedModule,
    LoggerModule
  ],
  controllers: [
    WebhookController,
    DownloadController
  ],
  providers: [
    AuthResolver,
    UserResolver,
    DoctorAppointmentResolver,
    PaymentResolver,
    MailService,
    AuthUseCase,
    UserUseCase,
    DoctorResolver,
    JwtAuthGuard,
    DoctorUseCase,
    CloudinaryService,
    PaymentService,
    DoctorAvailabilityResolver,
    AvailabilityLoader,
    AppointmentLoader,
    DoctorLoader,
    UserLoader,
    WebHookService,
    PaymentUseCase,
    PaymentService,
    ChatGateway,
    CallGateway,
    NotificationResolver,
    MessageUseCase,
    ConversationUseCase,
    MessageResolver,
    ConversationResolver,
    WalletResolver,
    WalletUseCase,
    ReviewsResolver,

    {
      provide: 'IAuthRepository',
      useClass: MongoAuthRepository,
    },
    {
      provide: 'IAuthService',
      useClass: AuthService,
    },
    {
      provide: 'ITimeZoneService',
      useClass: TimezoneService
    },
    {
      provide: 'IDoctorService',
      useClass: DoctorService
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
      provide: 'IAppointmentRepository',
      useClass: MongoAppointmentRepository
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
      provide: 'IAppointmentUseCase',
      useClass: AppointmentUseCase
    },
    {
      provide: 'ICloudinaryService',
      useClass: CloudinaryService,
    },
    {
      provide: 'ISupabaseService',
      useClass: SupabaseService
    },
    {
      provide: 'IAvailabilityUseCase',
      useClass: AvailabilityUseCase
    },
    {
      provide: 'IAvailabilityRepository',
      useClass: MongoAvailabilityRepository
    },
    {
      provide: 'IPaymentUseCase',
      useClass: PaymentUseCase
    },
    {
      provide: 'IPaymentService',
      useClass: PaymentService
    },
    {
      provide: 'IPaymentUseCase',
      useClass: PaymentUseCase
    },
    {
      provide: 'IPaymentService',
      useClass: PaymentService
    },
    {
      provide: 'IWebHookService',
      useClass: WebHookService
    },
    {
      provide: 'IPaymentRepository',
      useClass: PaymentRepository
    },
    {
      provide: 'INotificationUseCase',
      useClass: NotificationUseCase
    },
    {
      provide: 'INotificationRepository',
      useClass: NotificationRepository
    }, 
    {
      provide: 'IMessageUseCase',
      useClass: MessageUseCase
    }, 
    {
      provide: 'IConversationUseCase',
      useClass: ConversationUseCase
    },
    {
      provide: 'IMessageRepository',
      useClass: MessageRepository
    },
    {
      provide: 'IConversationRepository',
      useClass: ConversationRepository
    },
    {
      provide: 'INotificationService',
      useClass: NotificationService
    },
    {
      provide: 'INotificationOrchestrator',
      useClass: NotificationOrchestrator
    },
    {
      provide: 'IWalletUseCase',
      useClass: WalletUseCase
    }, 
    {
      provide: 'IWalletRepository',
      useClass: MongoWalletRepository
    },
    {
      provide: 'IReviewsUseCase',
      useClass: ReviewsUseCase
    }, 
    {
      provide: 'IReviewsRepository',
      useClass: MongoReviewsRepository
    }
  ],
  exports: [
    AvailabilityLoader,
    AppointmentLoader,
    DoctorLoader,
    UserLoader
  ]
})


export class GraphqlConfigModule { }