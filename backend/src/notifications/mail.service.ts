import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { User } from '../user/user.entity';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private readonly statusLabels: Record<string, string> = {
    PENDING:     'En attente',
    IN_PROGRESS: 'En cours',
    ACCEPTED:    'Acceptée',
    REJECTED:    'Rejetée',
    CONFIRMED:   'Confirmée',
  };

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
  async sendCredentials(user: User, plainPassword: string): Promise<void> {
    const fullName = `${user.firstName} ${user.lastName}`;
    await this.send(
      user.email,
      'Bienvenue sur la plateforme OTC - Vos identifiants de connexion',
      `
        <p>Bonjour <strong>${fullName}</strong>,</p>
        <p>Un compte a été créé pour vous sur la plateforme de l’<strong>Office de la Topographie et du Cadastre</strong>.</p>
        <p>Voici vos identifiants de connexion :</p>
        <ul>
          <li><strong>Email :</strong> ${user.email}</li>
          <li><strong>Rôle :</strong> ${user.role}</li>
          <li><strong>Mot de passe temporaire :</strong> ${plainPassword}</li>
        </ul>
        <p>Nous vous recommandons de changer ce mot de passe lors de votre première connexion.</p>
        <p>Pour vous connecter, rendez-vous sur l’application et utilisez ces identifiants.</p>
        <p>Cordialement,<br/>L’équipe OTC</p>
      `,
    );
  }
  async sendRequestCreated(
    to: string,
    agentName: string,
    requestNumber: number,
    requestTypeName: string,
  ): Promise<void> {
    await this.send(
      to,
      `Demande N°${requestNumber} soumise avec succès`,
      `
        <p>Bonjour <strong>${agentName}</strong>,</p>
        <p>Nous vous confirmons la soumission de votre demande <strong>${requestTypeName}</strong> (${requestNumber}).</p>
        <p>Elle est actuellement <strong>en attente</strong> de traitement par nos services.</p>
        <p>Vous serez informé dès qu’une décision sera prise.</p>
        <p>Cordialement,<br/>L’équipe OTC</p>
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
    const statusLabel = this.statusLabels[newStatus] ?? newStatus;

    let statusMessage = '';
    const statusUpper = newStatus.toUpperCase();
    if (statusUpper === 'ACCEPTED') {
      statusMessage = 'Nous sommes heureux de vous informer que votre demande a été <strong>acceptée</strong>.';
    } else if (statusUpper === 'REJECTED') {
      statusMessage = 'Nous regrettons de vous informer que votre demande a été <strong>rejetée</strong>.';
    } else if (statusUpper === 'IN_PROGRESS') {
      statusMessage = 'Votre demande est maintenant <strong>en cours</strong> de traitement.';
    } else if (statusUpper === 'CONFIRMED') {
      statusMessage = 'Votre demande a été <strong>confirmée</strong> avec succès.';
    } else {
      statusMessage = `Le statut de votre demande a été mis à jour : <strong>${statusLabel}</strong>.`;
    }

    const commentSection = adminComment
      ? `<p><strong>Observation :</strong> ${adminComment}</p>`
      : '';

    const subject = `Demande N°${requestNumber} - Statut mis à jour : ${statusLabel}`;

    await this.send(
      to,
      subject,
      `
        <p>Bonjour <strong>${agentName}</strong>,</p>
        <p>Le statut de votre demande <strong>${requestTypeName}</strong> (${requestNumber}) a été modifié.</p>
        <p>${statusMessage}</p>
        ${commentSection}
        <p>Cordialement,<br/>L’équipe OTC</p>
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
      `Demande N°${requestNumber} confirmée`,
      `
        <p>Bonjour <strong>${agentName}</strong>,</p>
        <p>Vous avez confirmé la demande <strong>${requestTypeName}</strong> (${requestNumber}).</p>
        <p>Nous vous remercions pour votre confirmation.</p>
        <p>Cordialement,<br/>L’équipe OTC</p>
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