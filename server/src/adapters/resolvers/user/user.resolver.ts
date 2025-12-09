import { Inject, Injectable, LoggerService, UseGuards } from '@nestjs/common';
import { Query, Mutation, Args, Resolver, Context } from '@nestjs/graphql';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ChangeStatusInput } from 'src/adapters/graphQL/types/user/changeStatus.input';
import { User } from 'src/adapters/graphQL/types/user/user.model';
import { deleteUserInput } from 'src/adapters/graphQL/types/user/deleteUser.input';
import { JwtAdminGuard } from 'src/common/guards/admin.guard';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { Doctor } from 'src/core/entities/doctor/doctor.entity';
import { FindUsersInput } from 'src/adapters/graphQL/types/user/findUsers.input';
import { IUserUseCase } from 'src/application/use-cases/interface/user.usecase.interface';
import { CountUsersInput } from 'src/adapters/graphQL/types/user/countUsers.input';
import { GqlContext } from 'src/common/types/gql-context.type';

@Injectable()
@Resolver(() => User)
export class UserResolver {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly _logger: LoggerService,
        @Inject('IUserUseCase') private readonly __userUseCase: IUserUseCase,
    ) { }

    @Query(() => [User], { name: 'findUsers' })
    @UseGuards(JwtAdminGuard)
    async findUsers(@Args('input') input: FindUsersInput): Promise<User[]> {
        return await this.__userUseCase.findUsers(input);
    }

    @Query(() => Number)
    async countUsers(@Args('input') input: CountUsersInput): Promise<number> {
        return await this.__userUseCase.countUsers(input);
    }

    @Mutation(() => Boolean, { name: 'changeStatus' })
    @UseGuards(JwtAdminGuard)
    async changeStatus(@Args('input') input: ChangeStatusInput): Promise<boolean> {
        return this.__userUseCase.changeUserStatus(input.userId, input.status)
    }

    @Mutation(() => Boolean, { name: 'deleteUser' })
    @UseGuards(JwtAdminGuard)
    async deleteUser(@Args('input') input: deleteUserInput): Promise<boolean> {
        return this.__userUseCase.deleteUser(input.userId)
    }

    @Query(() => User, { name: 'findUser' })
    @UseGuards(JwtAuthGuard)
    async findUser(
        @Context() context: GqlContext
    ): Promise<User | Doctor> {
        const userId = context.req.user?.userId;
        return await this.__userUseCase.findById(userId)
    }
}