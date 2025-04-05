import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: Number(this.configService.get('SMTP_PORT')),
      secure: this.configService.get('SMTP_SECURE') === 'true', // true для 465, false для 587/25
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendMail(to: string, subject: string, text: string) {
    await this.transporter.sendMail({
      from: this.configService.get('SMTP_FROM'),
      to,
      subject,
      text,
    });
  }

  async sendFeedback(
    userId: number,
    email: string,
    name: string,
    message: string,
  ) {
    const to = this.configService.get('FEEDBACK_EMAIL');
    const subject = 'Обратная связь от пользователя';
    const body = `
  🧾 Отзыв от пользователя:
  
  ID: ${userId}
  Имя: ${name}
  Email: ${email}
  
  💬 Сообщение:
  ${message}
    `;

    await this.sendMail(to, subject, body);
  }
}
