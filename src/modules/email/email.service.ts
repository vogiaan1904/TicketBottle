import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as pug from 'pug';
import { OrderSuccessDataDto } from '../order/interfaces/order-email-data.interface';
import { EmailDataInterface } from './interfaces/emailData.interface';
import * as path from 'path';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
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

    Handlebars.registerHelper('formatCurrency', (value: number) => {
      if (typeof value !== 'number') {
        value = Number(value);
      }
      if (isNaN(value)) {
        return value;
      }
      return value.toLocaleString('en-US');
    });
  }

  private getHTML(template: string): string {
    const filePath = path.join(
      process.cwd(),
      'src',
      'templates',
      `${template}.html`,
    );
    return fs.readFileSync(filePath, 'utf-8');
  }

  private renderHTML(template: string, context: object): string {
    const htmlTemplate = this.getHTML(template);
    const templateCompiled = Handlebars.compile(htmlTemplate);
    return templateCompiled(context);
  }

  private converPugtToHTML(template: string, context: object): string {
    const html = pug.renderFile(`src/templates/${template}.pug`, context);
    return html;
  }

  async sendEmail(data: EmailDataInterface): Promise<void> {
    await this.transporter.sendMail({
      from: data.from ?? 'noreply@example.com',
      ...data,
    });
  }

  async sendSuccessOrderEmail(
    email: string,
    context: OrderSuccessDataDto,
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Payment Success',
      html: this.renderHTML('payment/neworderSuccess', context),
    });
  }

  async sendUserVerifyEmail(email: string, token: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Reset your password',
      html: this.converPugtToHTML('auth/verifyEmail', { token }),
    });
  }

  async sendUserResetPasswordEmail(
    email: string,
    token: string,
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Verify your account',
      html: this.converPugtToHTML('auth/forgotPassword', { token }),
    });
  }
}
