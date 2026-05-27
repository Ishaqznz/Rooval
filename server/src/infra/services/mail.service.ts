import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import { IMailService } from 'src/application/services/mail.service.interface';
dotenv.config();

@Injectable()
export class MailService implements IMailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  private getEmailTemplate(content: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rooval</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F5F3F7;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #8B5FBF 0%, #61398F 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700; letter-spacing: 1px;">ROOVAL</h1>
                    <p style="margin: 10px 0 0 0; color: #D6C6E1; font-size: 14px;">Your Trusted Platform</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    ${content}
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #F5F3F7; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
                    <p style="margin: 0 0 10px 0; color: #4A4A4A; font-size: 14px;">
                      © ${new Date().getFullYear()} Rooval. All rights reserved.
                    </p>
                    <p style="margin: 0; color: #8B5FBF; font-size: 12px;">
                      This is an automated message, please do not reply to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  async sendOtpMail(to: string, token: string): Promise<boolean> {
    const content = `
      <div style="text-align: center;">
        <div style="background-color: #F5F3F7; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 30px; display: flex; align-items: center; justify-content: center;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#8B5FBF"/>
          </svg>
        </div>
        
        <h2 style="color: #4A4A4A; font-size: 24px; margin: 0 0 16px 0; font-weight: 600;">
          Verify Your Email Address
        </h2>
        
        <p style="color: #4A4A4A; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
          Thank you for signing up with Rooval! Please verify your email address by clicking the button below to complete your registration.
        </p>
        
        <a href="${process.env.FRONT_END_URL}/verify-email?token=${token}" 
           style="display: inline-block; background: linear-gradient(135deg, #8B5FBF 0%, #61398F 100%); color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; margin: 0 0 30px 0; box-shadow: 0 4px 6px rgba(139, 95, 191, 0.3);">
          Verify Email Address
        </a>
        
        <div style="background-color: #F5F3F7; border-left: 4px solid #8B5FBF; padding: 20px; margin-top: 30px; text-align: left; border-radius: 4px;">
          <p style="color: #4A4A4A; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
            Having trouble clicking the button?
          </p>
          <p style="color: #61398F; font-size: 13px; margin: 0; word-break: break-all;">
            Copy and paste this link into your browser:<br/>
            <span style="color: #8B5FBF;">${process.env.FRONT_END_URL}/verify-email?token=${token}</span>
          </p>
        </div>
        
        <p style="color: #4A4A4A; font-size: 13px; margin: 30px 0 0 0; line-height: 1.5;">
          If you didn't create an account with Rooval, you can safely ignore this email.
        </p>
      </div>
    `;

    const mailOptions = {
      from: `"Rooval" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Verify Your Email - Rooval',
      html: this.getEmailTemplate(content),
    };

    await this.transporter.sendMail(mailOptions);
    return true;
  }

  async sendForgotPasswordOtpMail(to: string, token: string): Promise<boolean> {
    const content = `
      <div style="text-align: center;">
        <div style="background-color: #F5F3F7; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 30px; display: flex; align-items: center; justify-content: center;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="#8B5FBF"/>
          </svg>
        </div>
        
        <h2 style="color: #4A4A4A; font-size: 24px; margin: 0 0 16px 0; font-weight: 600;">
          Reset Your Password
        </h2>
        
        <p style="color: #4A4A4A; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
          We received a request to reset your password for your Rooval account. Click the button below to create a new password.
        </p>
        
        <a href="${process.env.FRONT_END_URL}/verify-email?token=${token}" 
           style="display: inline-block; background: linear-gradient(135deg, #8B5FBF 0%, #61398F 100%); color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; margin: 0 0 30px 0; box-shadow: 0 4px 6px rgba(139, 95, 191, 0.3);">
          Reset Password
        </a>
        
        <div style="background-color: #F5F3F7; border-left: 4px solid #8B5FBF; padding: 20px; margin-top: 30px; text-align: left; border-radius: 4px;">
          <p style="color: #4A4A4A; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
            Having trouble clicking the button?
          </p>
          <p style="color: #61398F; font-size: 13px; margin: 0; word-break: break-all;">
            Copy and paste this link into your browser:<br/>
            <span style="color: #8B5FBF;">${process.env.FRONT_END_URL}/verify-email?token=${token}</span>
          </p>
        </div>
        
        <div style="background-color: #FFF9E6; border: 1px solid #FFE5A8; border-radius: 8px; padding: 20px; margin: 30px 0 0 0;">
          <p style="color: #4A4A4A; font-size: 14px; margin: 0; line-height: 1.5;">
            <strong>⚠️ Security Notice:</strong><br/>
            If you didn't request a password reset, please ignore this email or contact our support team if you have concerns about your account security.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Rooval" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Reset Your Password - Rooval',
      html: this.getEmailTemplate(content),
    };

    await this.transporter.sendMail(mailOptions);
    return true;
  }
}