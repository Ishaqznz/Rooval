import { Inject, Injectable } from '@nestjs/common';
import * as bycrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { IAuthService } from 'src/application/services/auth.service.interface';
import { IMailService } from 'src/application/services/mail.service.interface';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject('IMailService') private readonly _mailService: IMailService,
    private _jwtService: JwtService,
  ) { }
  private readonly saltRounds = 10;

  async sendOtp(email: string): Promise<boolean> {
    return this._mailService.sendOtpMail(email, this.generateOtp());
  }

  generateOtp(): string {
    return Math.round(Math.random() * 1000000).toString();
  }

  async hashPassword(password: string): Promise<string> {
    return await bycrypt.hash(password, this.saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bycrypt.compare(password, hash);
  }

  async genrateJwt(userId: string, role: string): Promise<string> {
    const payload = { userId, role };
    const accessToken = this._jwtService.sign(payload);
    return accessToken;
  }

  async generateRefreshToken(userId: string, role: string): Promise<string> {
    const payload = { userId, role };
    const refreshToken = this._jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
    return refreshToken;
  }

  async rotateAccessToken(refreshToken: string): Promise<string> {
    const decoded = this._jwtService.verify(refreshToken, {
      secret: process.env.REFRESH_TOKEN_SECRET
    }) as { userId: string, role: string }

    const payload = { userId: decoded.userId, role: decoded.role }
    return this._jwtService.sign(payload)
  }
}
