import { Module } from '@nestjs/common';
import { GraphqlFrameworkModule } from './frameworks/graphql/graphql.module';
import { GraphqlAdaptersModule } from './adapters/graphql/graphql.module';
import { ConfigModule } from '@nestjs/config';
import { MongoConfigModule } from './frameworks/database/mongoose/config/mongo.config';
import { RedisConfigModule } from './frameworks/database/redis/config/redis.config';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    GraphqlFrameworkModule,
    GraphqlAdaptersModule,
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
export class AppModule {}
