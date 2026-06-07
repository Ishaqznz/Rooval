import { Module } from '@nestjs/common';
import { GraphqlFrameworkModule } from './infra/graphql/graphql.module';
import { GraphqlConfigModule } from './infra/modules/graphql.module';
import { ConfigModule } from '@nestjs/config';
import { MongoConfigModule } from './infra/database/mongoose/config/mongo.config';
import { RedisConfigModule } from './infra/database/redis/config/redis.config';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { registerGraphQLEnums } from './adapters/api/graphQL/enums/register.enum';
dotenv.config();

@Module({
  imports: [
    GraphqlFrameworkModule,
    GraphqlConfigModule,
    MongoConfigModule,
    RedisConfigModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRY },
    }),
  ],
})

export class AppModule {
  constructor() {
    registerGraphQLEnums();
  }
}
