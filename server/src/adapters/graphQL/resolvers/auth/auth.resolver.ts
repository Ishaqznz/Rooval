import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Query, Mutation, Args } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';
import { User } from 'src/adapters/types/user/user.model';
import { SignUpInput } from 'src/adapters/types/user/signup.input';
import { AuthUseCase } from 'src/application/use-cases/auth.usecase';
import { TokenInput } from 'src/adapters/types/user/token.input';
import { Context } from '@nestjs/graphql';
import { Response } from 'express';
import { LoginInput } from 'src/adapters/types/user/login.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { EmailInput } from 'src/adapters/types/user/email.input';
import { PasswordInput } from 'src/adapters/types/user/password.input';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Doctor } from 'src/adapters/types/doctor/doctor.model';

@Injectable()
@Resolver(() => User)
export class AuthResolver {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly _logger: LoggerService,
    private readonly _authUseCase: AuthUseCase,
  ) {}

  @Query(() => [User], { name: 'findUsers' })
  async findUsers(): Promise<User[]> {
    this._logger.debug('here all the data is actually fetching!')
    return await this._authUseCase.findUsers();
  }

  @Mutation(() => User, { name: 'createUser' })
  async createUser(@Args('input') input: SignUpInput): Promise<User> {
    this._logger.debug('The incoming data in the signup: ', input)
    return await this._authUseCase.signUp(input);
  }

  @Mutation(() => User, { name: 'verifyEmail' })
  async verifyEmail(
    @Context() context: any,
    @Args('input') input: TokenInput,
  ): Promise<User> {
    const res: Response = context.res;
    const user = await this._authUseCase.verifyEmail(input.token);
    const jwtToken = await this._authUseCase.generateJwt(user.id, 'user');
    res.cookie('token', jwtToken, {
      httpOnly: true,
      maxAge: Number(process.env.COOKIE_EXPIRY),
    });
    return user;
  }

  @Mutation(() => User, { name: 'loginUser' })
  async loginUser(
    @Context() context: any,
    @Args('input') input: LoginInput,
  ): Promise<User | Doctor> {
    const res: Response = context.res;
    const user = await this._authUseCase.login(input);
    const jwtToken = await this._authUseCase.generateJwt(user.id, 'user');
    res.cookie('token', jwtToken, {
      httpOnly: true,
      maxAge: Number(process.env.COOKIE_EXPIRY),
    });
    return user;
  }

  @Mutation(() => Boolean, { name: 'forgotPassword' })
  async forgotPassword(@Args('input') input: EmailInput): Promise<boolean> {
    return this._authUseCase.forgotPassword(input);
  }

  @Mutation(() => User, { name: 'verifyResetToken' })
  @UseGuards(JwtAuthGuard)
  async verifyResetToken(
    @Context() context: any,
    @Args('input') input: TokenInput,
  ): Promise<User> {
    const user = await this._authUseCase.verifyResetToken(input.token);
    const res: Response = context.res;
    const token = await this._authUseCase.generateJwt(user.id, 'user');
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: Number(process.env.COOKIE_EXPIRY),
    });
    return user;
  }

  @Mutation(() => User, { name: 'verifyResetPassword' })
  @UseGuards(JwtAuthGuard)
  async verifyRestPassword(
    @Context() context: any,
    @Args('input') input: PasswordInput,
  ): Promise<User> {
    const userId = context.req.user?.userId;
    return this._authUseCase.verifyResetPassword(input.password, userId);
  }

  @Mutation(() => User, { name: 'AdminLogin' })
  async adminLogin(
    @Context() context: any,
    @Args('input') input: LoginInput
  ): Promise<User> {
    const res: Response = context.res;
    const user = await this._authUseCase.adminLogin(input)
    const jwtToken = await this._authUseCase.generateJwt(user.id, 'admin');
    res.cookie('token', jwtToken, {
      httpOnly: true,
      maxAge: Number(process.env.COOKIE_EXPIRY),
    });
    return user;
  } 
}