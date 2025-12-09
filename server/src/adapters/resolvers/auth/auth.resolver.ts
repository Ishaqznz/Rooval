import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Mutation, Args } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';
import { User } from 'src/adapters/graphQL/types/user/user.model';
import { SignUpInput } from 'src/adapters/graphQL/types/user/signup.input';
import { TokenInput } from 'src/adapters/graphQL/types/user/token.input';
import { Context } from '@nestjs/graphql';
import { Response } from 'express';
import { LoginInput } from 'src/adapters/graphQL/types/user/login.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { EmailInput } from 'src/adapters/graphQL/types/user/email.input';
import { PasswordInput } from 'src/adapters/graphQL/types/user/password.input';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Doctor } from 'src/adapters/graphQL/types/doctor/doctor.model';
import { TokenUtil } from 'src/utils/token.util';
import { AuthErrorType } from 'src/core/enums/auth.enums';
import { IAuthUseCase } from 'src/application/use-cases/interface/auth.usecase.interface';
import { GoogleLoginInput } from 'src/adapters/graphQL/types/user/googleLogin.input';
import { GqlContext } from 'src/common/types/gql-context.type';

@Injectable()
@Resolver(() => User)
export class AuthResolver {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly _logger: LoggerService,
    @Inject('IAuthUseCase') private readonly _authUseCase: IAuthUseCase,
  ) { }

  @Mutation(() => User)
  async createUser(@Args('input') input: SignUpInput): Promise<User> {
    return await this._authUseCase.signUp(input);
  }

  @Mutation(() => User)
  async verifyEmail(
    @Context() context: GqlContext,
    @Args('input') input: TokenInput,
  ): Promise<User | Doctor> {
    const res: Response = context.res;
    const user = await this._authUseCase.verifyEmail(input.token);
    const accessToken = await this._authUseCase.generateJwt(user.id, user.role);
    const refreshToken = await this._authUseCase.generateRefreshToken(user.id, user.role)
    TokenUtil.sendAuthCookies(res, accessToken, refreshToken);
    return user;
  }

  @Mutation(() => User)
  async loginUser(
    @Context() context: GqlContext,
    @Args('input') input: LoginInput,
  ): Promise<User | Doctor> {
    const res: Response = context.res;
    const user = await this._authUseCase.login(input);
    const accessToken = await this._authUseCase.generateJwt(user.id, user.role);
    const refreshToken = await this._authUseCase.generateRefreshToken(user.id, user.role);
    TokenUtil.sendAuthCookies(res, accessToken, refreshToken)
    return user;
  }

  @Mutation(() => Boolean)
  async logout(@Context() context: GqlContext): Promise<boolean> {
    const res: Response = context.res
    TokenUtil.clearAuthCookies(res)
    return true;
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Args('input') input: EmailInput): Promise<boolean> {
    return this._authUseCase.forgotPassword(input);
  }

  @Mutation(() => User)
  async verifyResetToken(
    @Context() context: GqlContext,
    @Args('input') input: TokenInput,
  ): Promise<User> {
    const user = await this._authUseCase.verifyResetToken(input.token);
    const res: Response = context.res;
    const accessToken = await this._authUseCase.generateJwt(user.id, user.role);
    const refreshToken = await this._authUseCase.generateRefreshToken(user.id, user.role);
    TokenUtil.sendAuthCookies(res, accessToken, refreshToken)
    return user;
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard)
  async verifyResetPassword(
    @Context() context: GqlContext,
    @Args('input') input: PasswordInput,
  ): Promise<User | Doctor> {
    const userId = context.req.user?.userId;
    return this._authUseCase.verifyResetPassword(input.password, userId);
  }

  @Mutation(() => User)
  async adminLogin(
    @Context() context: GqlContext,
    @Args('input') input: LoginInput
  ): Promise<User> {
    const res: Response = context.res;
    const user = await this._authUseCase.adminLogin(input)
    const accessToken = await this._authUseCase.generateJwt(user.id, 'admin');
    const refreshToken = await this._authUseCase.generateRefreshToken(user.id, 'admin')
    TokenUtil.sendAuthCookies(res, accessToken, refreshToken)
    return user;
  }

  @Mutation(() => String)
  async refreshToken(
    @Context() context: GqlContext
  ): Promise<boolean> {
    const res: Response = context.res;
    const refreshToken = context.req.cookies?.refreshToken;
    if (!refreshToken) throw new Error(AuthErrorType.NO_REFRESH_TOKEN_FOUND);
    const accessToken = await this._authUseCase.refreshTokens(refreshToken)
    TokenUtil.sendAccessToken(res, accessToken)
    return true;
  }

  @Mutation(() => User)
  async loginWithGoogle(
    @Context() context: GqlContext,
    @Args('input') input: GoogleLoginInput
  ): Promise<User | Doctor> {
    const res: Response = context.res;
    const user = await this._authUseCase.loginWithGoogle(input)
    const accessToken = await this._authUseCase.generateJwt(user.id, user.role);
    const refreshToken = await this._authUseCase.generateRefreshToken(user.id, user.role)
    console.log('the utile are sending properly!')
    TokenUtil.sendAuthCookies(res, accessToken, refreshToken)
    return user;
  }
}