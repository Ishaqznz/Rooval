import { Inject, Injectable, LoggerService, UseGuards, UsePipes } from '@nestjs/common';
import { Query, Mutation, Args, Resolver, Context, ResolveField, Parent } from '@nestjs/graphql';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ChangeStatusInput } from 'src/adapters/api/graphQL/types/user/input/changeStatus.input';
import { User } from 'src/adapters/api/graphQL/types/user/model/user.model';
import { deleteUserInput } from 'src/adapters/api/graphQL/types/user/input/deleteUser.input';
import { JwtAdminGuard } from 'src/common/guards/admin.guard';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { FindUsersInput } from 'src/adapters/api/graphQL/types/user/input/findUsers.input';
import { IUserUseCase } from 'src/application/use-cases/interface/user.usecase.interface';
import { CountUsersInput } from 'src/adapters/api/graphQL/types/user/input/countUsers.input';
import { GqlContext } from 'src/common/types/gql-context.type';
import { UserUpdateProfileInput } from 'src/adapters/api/graphQL/types/user/input/updateProfilePhoto.input';
import { UpdateUserProfileInput } from '../../types/user/input/updateProfile.input';
import { UppercasePipe } from 'src/common/pipes/uppercase/uppercase.pipe';
import { Appointment } from '../../types/appointment/model/appointment.model';
import { FindUserByIdInput } from '../../types/user/input/findUserById.input';
import { IsChatEnabledInput } from '../../types/user/input/isChatEnabled.input';
import { AdminDashboard } from '../../types/user/model/adminDashboard.model';

@Injectable()
@Resolver(() => User)
export class UserResolver {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly _logger: LoggerService,
        @Inject('IUserUseCase')
        private readonly __userUseCase: IUserUseCase,
    ) { }

    @Query(() => User, { name: 'findUser' })
    @UseGuards(JwtAuthGuard)
    async findUser(
        @Context() context: GqlContext
    ): Promise<User> {
        const userId = context.req.user?.userId;
        return await this.__userUseCase.findById(userId)
    }

    @Query(() => [User], { name: 'findUsers' })
    @UseGuards(JwtAdminGuard)
    async findUsers(@Args('input') input: FindUsersInput): Promise<User[]> {
        return await this.__userUseCase.findUsers(input);
    }

    @Query(() => User)
    async findUserById(@Args('input') input: FindUserByIdInput): Promise<User> {
        return await this.__userUseCase.findById(input.userId)
    }

    @ResolveField(() => [Appointment])
    @UseGuards(JwtAuthGuard)
    async appointments(
        @Parent() user: User,
        @Context() context: GqlContext
    ): Promise<Appointment[]> {
        const appointments = await context.loaders.appointments.byUserId.load(user.id)
        return appointments
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

    @Mutation(() => String)
    @UseGuards(JwtAuthGuard)
    async updateUserProfilePhoto(
        @Context() context: GqlContext,
        @Args('input') input: UserUpdateProfileInput
    ): Promise<string> {
        const userId = context.req.user?.userId;
        return this.__userUseCase.updateProfilePhoto({ profilePhoto: input.profilePhoto, userId });
    }

    @Mutation(() => Boolean)
    @UseGuards(JwtAuthGuard)
    @UsePipes(UppercasePipe)
    async updateUserProfile(
        @Context() context: GqlContext,
        @Args('input') input: UpdateUserProfileInput
    ): Promise<boolean> {
        const userId = context.req.user?.userId
        return this.__userUseCase.updateProfile({ userId, ...input })
    }

    @Mutation(() => Boolean)
    @UseGuards(JwtAuthGuard)
    async isChatEnabled(
        @Context() context: GqlContext,
        @Args('input') input: IsChatEnabledInput
    ): Promise<boolean> {
        const userId = context.req.user.userId;
        const doctorId = input.doctorId
        return this.__userUseCase.isChatEnabled({ userId, doctorId });
    }

    @Query(() => AdminDashboard)
    @UseGuards(JwtAdminGuard)
    async getDashboardData(): Promise<AdminDashboard> {
        return await this.__userUseCase.getDashboardData()
    }
}
