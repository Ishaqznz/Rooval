export interface IMailService {
  sendOtpMail(to: string, token: string): Promise<boolean>;
  sendForgotPasswordOtpMail(to: string, token: string): Promise<boolean>;
}
