export interface IAuthService {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
  genrateJwt(userId: string, role: string): Promise<string>;
}
