import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: any;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter() {
    // CONFIGURACIÓN SIMPLE PARA GMAIL según documentación de Nodemailer
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // ← Usar servicio Gmail directamente
      auth: {
        user: 'systemsghalmacah@gmail.com', // ← Tu email
        pass: 'amznvzogzflxtowz', // ← Tu contraseña de aplicación
      },
    });

    // Verificar la conexión
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Conexión SMTP establecida correctamente con Gmail');
    } catch (error) {
      this.logger.error('❌ Error al conectar con Gmail:', error.message);
    }
  }

  // eslint-disable-next-line prettier/prettier
  private async loadTemplate(templateName: string, context: any): Promise<string> {
    try {
      const templatePath = path.join(
        process.cwd(),
        'src/notifications/templates',
        `${templateName}.hbs`,
      );
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateContent);
      return template(context);
    } catch (error) {
      this.logger.error(`Error al cargar template ${templateName}:`, error);
      throw new Error(`Template ${templateName} no encontrado`);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const html = await this.loadTemplate(options.template, options.context);

      const mailOptions = {
        from: {
          name: 'Sistema de Envíos', // ← Hardcoded por simplicidad
          address: 'systemsghalmacah@gmail.com', // ← Tu email
        },
        to: options.to,
        subject: options.subject,
        html,
        attachments: options.attachments || [],
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `📧 Email enviado exitosamente a ${options.to}. MessageId: ${result.messageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error('❌ Error al enviar email:', error);
      return false;
    }
  }
}
