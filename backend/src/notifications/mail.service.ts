import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT ?? '587'),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendRequestCreated(
    to: string,
    agentName: string,
    requestNumber: number,
    requestTypeName: string,
  ): Promise<void> {
    await this.send(
      to,
      `Demande #${requestNumber} soumise`,
      `
        <p>Bonjour <strong>${agentName}</strong>,</p>
        <p>Votre demande <strong>${requestTypeName}</strong> (#${requestNumber}) a bien été soumise et est en attente de traitement.</p>
        <p>Vous serez notifié dès qu'elle sera traitée.</p>
      `,
    );
  }

  async sendStatusUpdated(
    to: string,
    agentName: string,
    requestNumber: number,
    requestTypeName: string,
    newStatus: string,
    adminComment?: string,
  ): Promise<void> {
    const commentSection = adminComment
      ? `<p><strong>Observation :</strong> ${adminComment}</p>`
      : '';

    await this.send(
      to,
      `Demande #${requestNumber} – statut mis à jour : ${newStatus}`,
      `
        <p>Bonjour <strong>${agentName}</strong>,</p>
        <p>Le statut de votre demande <strong>${requestTypeName}</strong> (#${requestNumber}) a été mis à jour.</p>
        <p><strong>Nouveau statut :</strong> ${newStatus}</p>
        ${commentSection}
      `,
    );
  }

  async sendConfirmed(
    to: string,
    agentName: string,
    requestNumber: number,
    requestTypeName: string,
  ): Promise<void> {
    await this.send(
      to,
      `Demande #${requestNumber} confirmée`,
      `
        <p>Bonjour <strong>${agentName}</strong>,</p>
        <p>Vous avez confirmé la demande <strong>${requestTypeName}</strong> (#${requestNumber}).</p>
      `,
    );
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"OTC Admin" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}`, err);
    }
  }
}