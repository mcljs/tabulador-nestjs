import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { EnvioEntity } from '../../tabulador/entities/envio.entity';
import { UsersEntity } from '../../users/entities/users.entity';

export interface NotificationContext {
  user: UsersEntity;
  envio: EnvioEntity;
  additionalData?: any;
}

@Injectable()
export class NotificationService {
  constructor(private emailService: EmailService) {}

  // Notificación cuando se crea un nuevo envío
  async notificarNuevoEnvio(context: NotificationContext): Promise<void> {
    const { user, envio } = context;

    await this.emailService.sendEmail({
      to: user.email,
      subject: `Nuevo envío creado - ${envio.trackingNumber}`,
      template: 'nuevo-envio',
      context: {
        nombreUsuario: user.firstName || user.username,
        trackingNumber: envio.trackingNumber,
        tipoEnvio: envio.tipoEnvio,
        origen: envio.ruteInitial,
        destino: envio.ruteFinish,
        peso: envio.peso,
        totalAPagar: envio.totalAPagar,
        fechaCreacion: new Date().toLocaleDateString('es-ES'),
      },
    });
  }

  // Notificación cuando cambia el estado del envío
  async notificarCambioEstado(
    context: NotificationContext,
    estadoAnterior: string,
  ): Promise<void> {
    const { user, envio } = context;

    await this.emailService.sendEmail({
      to: user.email,
      subject: `Actualización de envío - ${envio.trackingNumber}`,
      template: 'cambio-estado',
      context: {
        nombreUsuario: user.firstName || user.username,
        trackingNumber: envio.trackingNumber,
        estadoAnterior,
        estadoActual: envio.status,
        fechaActualizacion: new Date().toLocaleDateString('es-ES'),
      },
    });
  }

  // Notificación de confirmación de envío
  async notificarConfirmacionEnvio(
    context: NotificationContext,
  ): Promise<void> {
    const { user, envio } = context;

    await this.emailService.sendEmail({
      to: user.email,
      subject: `Envío confirmado - ${envio.trackingNumber}`,
      template: 'confirmacion-envio',
      context: {
        nombreUsuario: user.firstName || user.username,
        trackingNumber: envio.trackingNumber,
        tipoEnvio: envio.tipoEnvio,
        tipoVehiculo: envio.tipoVehiculo,
        origen: envio.ruteInitial,
        destino: envio.ruteFinish,
        peso: envio.peso,
        volumen: envio.volumen,
        flete: envio.flete,
        proteccionEncomienda: envio.proteccionEncomienda,
        totalPeaje: envio.totalPeaje,
        costoHospedaje: envio.costoHospedaje,
        subtotal: envio.subtotal,
        iva: envio.iva,
        franqueoPostal: envio.franqueoPostal,
        totalAPagar: envio.totalAPagar,
        fechaConfirmacion: new Date().toLocaleDateString('es-ES'),
      },
    });
  }

  // Notificación cuando el envío está en tránsito
  async notificarEnvioEnTransito(context: NotificationContext): Promise<void> {
    const { user, envio } = context;

    await this.emailService.sendEmail({
      to: user.email,
      subject: `Tu envío está en camino - ${envio.trackingNumber}`,
      template: 'envio-en-transito',
      context: {
        nombreUsuario: user.firstName || user.username,
        trackingNumber: envio.trackingNumber,
        origen: envio.ruteInitial,
        destino: envio.ruteFinish,
        tipoVehiculo: envio.tipoVehiculo,
        fechaEnvio: new Date().toLocaleDateString('es-ES'),
      },
    });
  }

  // Notificación cuando el envío ha sido entregado
  async notificarEnvioEntregado(context: NotificationContext): Promise<void> {
    const { user, envio } = context;

    await this.emailService.sendEmail({
      to: user.email,
      subject: `Envío entregado exitosamente - ${envio.trackingNumber}`,
      template: 'envio-entregado',
      context: {
        nombreUsuario: user.firstName || user.username,
        trackingNumber: envio.trackingNumber,
        destino: envio.ruteFinish,
        fechaEntrega: new Date().toLocaleDateString('es-ES'),
      },
    });
  }

  // Notificación de cotización
  async notificarCotizacion(
    user: UsersEntity,
    envioCalculado: any,
  ): Promise<void> {
    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Cotización de envío - Sistema de Envíos',
      template: 'cotizacion',
      context: {
        nombreUsuario: user.firstName || user.username,
        tipoEnvio: envioCalculado.tipoEnvio,
        peso: envioCalculado.peso,
        volumen: envioCalculado.volumen,
        tipoVehiculo: envioCalculado.tipoVehiculo,
        flete: envioCalculado.flete,
        proteccionEncomienda: envioCalculado.proteccionEncomienda,
        totalPeaje: envioCalculado.totalPeaje,
        costoHospedaje: envioCalculado.costoHospedaje,
        subtotal: envioCalculado.subtotal,
        iva: envioCalculado.iva,
        franqueoPostal: envioCalculado.franqueoPostal,
        totalAPagar: envioCalculado.totalAPagar,
        fechaCotizacion: new Date().toLocaleDateString('es-ES'),
      },
    });
  }
}
