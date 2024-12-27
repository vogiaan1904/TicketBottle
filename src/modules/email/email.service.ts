import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as pug from 'pug';
import { EmailDataInterface } from './interfaces/emailData.interface';
import { OrderSuccessDataDto } from './interfaces/payment/orderSuccess.interface';
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  private convertToHTML(template: string, context: object): string {
    const html = pug.renderFile(`src/templates/${template}.pug`, context);
    return html;
  }

  async sendEmail(data: EmailDataInterface): Promise<void> {
    await this.transporter.sendMail({
      from: data.from ?? 'noreply@example.com',
      ...data,
    });
  }

  async sendOrderSuccessEmail(
    email: string,
    context: OrderSuccessDataDto,
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Payment Success',
      html: this.convertToHTML('payment/orderSuccess', {
        eventName: context.eventName,
        tickets: context.tickets,
        totalPayment: context.totalPayment,
        orderTime: context.orderTime,
      }),
    });
  }

  async sendUserVerifyEmail(email: string, token: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Reset your password',
      html: this.convertToHTML('auth/verifyEmail', { token }),
    });
  }

  async sendUserResetPasswordEmail(
    email: string,
    token: string,
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Verify your account',
      html: this.convertToHTML('auth/forgotPassword', { token }),
    });
  }
}
