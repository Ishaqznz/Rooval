export interface IAuthService {
  sendOtp(email: string): Promise<boolean>;
  generateOtp(): string;

  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;

  genrateJwt(userId: string, role: string): Promise<string>;
  generateRefreshToken(userId: string, role: string): Promise<string>;

  rotateAccessToken(refreshToken: string): Promise<string>;
}
