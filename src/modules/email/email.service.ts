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
}
