import { Injectable } from '@nestjs/common';
import { IAuthService } from 'src/application/services/auth.service';
import { MailService } from './mail.service';
import * as bycrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private _mailService: MailService,
    private _jwtService: JwtService,
  ) {}
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
}
