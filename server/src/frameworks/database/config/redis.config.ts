import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    RedisModule.forRoot({
      type: 'single',
      options: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        retryStrategy: (times) => {
          console.log(`Retry attempt ${times}`);
          return Math.min(times * 100, 2000);
        },
        showFriendlyErrorStack: true,
      },
    }),
  ],
})
export class RedisConfigModule {}
