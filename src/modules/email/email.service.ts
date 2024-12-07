import { Injectable } from '@nestjs/common';
import { EmailDataInterface } from './interfaces/email.interface';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(data: EmailDataInterface) {
    await this.mailerService.sendMail({
      from: data.from ?? 'noreply@example.com',
      ...data,
    });
  }

  async sendUserVerifyEmail(email: string, token: string) {
    await this.sendEmail({
      to: email,
      subject: 'Confirm your account',
      template: 'confirmation',
      context: {
        token,
      },
    });
  }

  async sendUserResetPasswordEmail(
    email: string,
    token: string,
  ): Promise<void> {
    this.sendEmail({
      to: email,
      subject: 'Verify your account',
      template: 'auth/forgotPassword',
      context: {
        token,
      },
    });
  }
}
