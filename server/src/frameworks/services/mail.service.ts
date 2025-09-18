import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class MailService {
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

  async sendOtpMail(to: string, token: string): Promise<boolean> {
    const mailOptions = {
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Your OTP Code',
      text: `Verify the account by clicking the link!`,
      html: `
      <a href="${process.env.FRONT_END_URL}/verify-email?token=${token}"> 
        Click here to verify your email
      </a>
      `,
    };

    await this.transporter.sendMail(mailOptions);
    return true;
  }

  async sendForgotPasswordOtpMail(to: string, token: string): Promise<boolean> {
    const mailOptions = {
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Your OTP Code',
      text: `Verify the account by clicking the link!`,
      html: `
      <a href="${process.env.FRONT_END_URL}/forgot-email?token=${token}"> 
        Click here to verify your email
      </a>
      `,
    };

    await this.transporter.sendMail(mailOptions);
    return true;
  }
}
