import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { GraphQLError } from 'graphql';

import { AvailabilityLoader } from 'src/adapters/api/graphQL/loaders/availability.loader';
import { AppointmentLoader } from 'src/adapters/api/graphQL/loaders/appointment.loader';
import { GraphqlAdaptersModule } from 'src/adapters/api/graphQL/modules/graphql.module';
import { DoctorLoader } from 'src/adapters/api/graphQL/loaders/doctor.loader';
import { UserLoader } from 'src/adapters/api/graphQL/loaders/user.loader';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [GraphqlAdaptersModule],

      inject: [AvailabilityLoader, AppointmentLoader, DoctorLoader, UserLoader],

      useFactory: (
        availabilityLoader: AvailabilityLoader,
        appointmentLoader: AppointmentLoader,
        doctorLoader: DoctorLoader,
        userLoader: UserLoader
      ) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        playground: true,
        introspection: true,
        csrfPrevention: false,

        context: ({ req, res }) => ({
          req,
          res,
           loaders: {
            availability: availabilityLoader.create(),
            doctor: doctorLoader.create(),
            user: userLoader.create(),
            appointments: {
              byUserId: appointmentLoader.byUserId(),
              byDoctorId: appointmentLoader.byDoctorId(),
            },
          },
        }),

        formatError: (error: GraphQLError) => {
          const originalError = error.extensions?.originalError as
            | { message?: string; code?: string }
            | undefined;

          return {
            success: false,
            message: originalError?.message ?? error.message,
            code:
              originalError?.code ??
              error.extensions?.code ??
              'INTERNAL_ERROR',
            timestamp: new Date().toISOString(),
          };
        },
      }),
    }),
  ],
})
export class GraphqlFrameworkModule { }
