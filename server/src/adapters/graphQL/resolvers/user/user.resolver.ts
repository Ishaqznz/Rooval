import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Query, Mutation, Args, Resolver } from '@nestjs/graphql';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { UserUseCase } from 'src/application/use-cases/user.usecase';
import { ChangeStatusInput } from 'src/adapters/types/user/changeStatus.input';
import { User } from 'src/adapters/types/user/user.model';

@Injectable()
@Resolver(() => User)
export class UserResolver {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly _logger: LoggerService,
        private readonly __userUseCase: UserUseCase
    ) {}

    @Mutation(() => Boolean, { name: 'changeStatus' })
    async changeStatus(@Args('input') input: ChangeStatusInput): Promise<boolean> {
        return this.__userUseCase.changeUserStatus(input.userId, input.status)
    }
}