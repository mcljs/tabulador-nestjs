import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from '../services/email.service';

@Controller('test-email')
export class TestEmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendTestEmail(@Body() body: { email: string; nombre: string }) {
    try {
      console.log('Intentando enviar email a:', body.email);

      const result = await this.emailService.sendEmail({
        to: body.email,
        subject: 'Email de Prueba - Sistema de Envíos',
        template: 'test-email',
        context: {
          nombreUsuario: body.nombre,
          fecha: new Date().toLocaleDateString('es-ES'),
        },
      });

      return {
        success: result,
        message: result
          ? 'Email enviado correctamente'
          : 'Error al enviar email',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error en controlador:', error);
      return {
        success: false,
        message: 'Error al enviar email',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Endpoint adicional para verificar configuración
  @Post('verify-config')
  async verifyConfig() {
    return {
      smtp_host: process.env.SMTP_HOST,
      smtp_port: process.env.SMTP_PORT,
      smtp_user: process.env.SMTP_USER,
      email_from: process.env.EMAIL_FROM,
      email_from_name: process.env.EMAIL_FROM_NAME,
      // No mostramos la contraseña por seguridad
      smtp_pass_configured: !!process.env.SMTP_PASS,
    };
  }
}
