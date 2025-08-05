import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { EnvioEntity } from '../entities/envio.entity';
import {
  CalculaterDto,
  CreateEnvioDto,
  UpdateEnvioDto,
} from '../dto/create-envio.dto';
import { UsersService } from 'src/users/services/users.service';
import { ConfiguracionService } from './configuracion.service';
import { NotificationService } from '../../notifications/services/notification.service';

@Injectable()
export class TabuladorService {
  constructor(
    private readonly configuracionService: ConfiguracionService,
    @InjectRepository(EnvioEntity)
    private readonly envioRepository: Repository<EnvioEntity>,
    private readonly usersService: UsersService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Calcula el volumen de un paquete en metros cúbicos
   */
  private calcularVolumen(ancho: number, alto: number, largo: number): number {
    return (ancho * alto * largo) / 1000000; // Convertir cm³ a m³
  }

  /**
   * Determina el tipo de vehículo adecuado según el peso y volumen
   */
  private determinarTipoVehiculo(peso: number, volumen: number): string {
    // Primero selección por volumen
    let tipoVehiculo: string;

    if (volumen <= 2.25) {
      tipoVehiculo = 'SUSUKI_EECO'; // Capacidad 2.25 m3
    } else if (volumen <= 3.3) {
      tipoVehiculo = 'MITSUBISHI_L300'; // Capacidad 3.3 m3
    } else if (volumen <= 5) {
      // Asumiendo capacidad de NHR
      tipoVehiculo = 'NHR';
    } else if (volumen <= 8) {
      // Asumiendo capacidad de Canter Cava Corta
      tipoVehiculo = 'CANTER_CAVA_CORTA';
    } else {
      tipoVehiculo = 'CANTER_CAVA_LARGA';
    }

    // Ahora verificamos si el vehículo seleccionado por volumen también cumple con la capacidad de peso
    if (tipoVehiculo === 'SUSUKI_EECO' && peso > 450) {
      // El vehículo seleccionado por volumen no cumple con el peso requerido
      // Seleccionamos un vehículo basado en el peso
      if (peso <= 900) {
        tipoVehiculo = 'MITSUBISHI_L300';
      } else if (peso <= 1500) {
        tipoVehiculo = 'NHR';
      } else if (peso <= 3500) {
        tipoVehiculo = 'CANTER_CAVA_CORTA';
      } else {
        tipoVehiculo = 'CANTER_CAVA_LARGA';
      }
    } else if (tipoVehiculo === 'MITSUBISHI_L300' && peso > 900) {
      if (peso <= 1500) {
        tipoVehiculo = 'NHR';
      } else if (peso <= 3500) {
        tipoVehiculo = 'CANTER_CAVA_CORTA';
      } else {
        tipoVehiculo = 'CANTER_CAVA_LARGA';
      }
    } else if (tipoVehiculo === 'NHR' && peso > 1500) {
      if (peso <= 3500) {
        tipoVehiculo = 'CANTER_CAVA_CORTA';
      } else {
        tipoVehiculo = 'CANTER_CAVA_LARGA';
      }
    } else if (tipoVehiculo === 'CANTER_CAVA_CORTA' && peso > 3500) {
      tipoVehiculo = 'CANTER_CAVA_LARGA';
    }

    return tipoVehiculo;
  }

  /**
   * Obtiene el costo según el tipo de vehículo para peaje
   */
  private obtenerCostoVehiculoPeaje(tipoVehiculo: string, config: any): number {
    switch (tipoVehiculo) {
      case 'SUSUKI_EECO':
        return config.costoPeajeSusuki;
      case 'MITSUBISHI_L300':
        return config.costoPeajeL300;
      case 'NHR':
        return config.costoPeajeNHR;
      case 'CANTER_CAVA_CORTA':
        return config.costoPeajeCanterCorta;
      case 'CANTER_CAVA_LARGA':
        return config.costoPeajeCanterLarga;
      case 'PLATAFORMA':
        return config.costoPeajePlatforma;
      case 'PITMAN':
        return config.costoPeajePitman;
      case 'CHUTO':
        return config.costoPeajeChuto;
      default:
        return config.costoPeajeNHR; // Default a NHR
    }
  }

  /**
   * Obtiene el costo de peaje según la distancia y el tipo de vehículo
   */
  private obtenerCostoPeaje(
    distancia: number,
    tipoVehiculo: string,
    tipoEnvio: string, // Añadir tipo de envío como parámetro
    config: any,
  ): { cantidadPeajes: number; costoPeaje: number; totalPeaje: number } {
    let cantidadPeajes = 0;

    // Determinamos la cantidad de peajes según la distancia
    if (distancia <= 100) {
      cantidadPeajes = 1;
    } else if (distancia <= 250) {
      cantidadPeajes = 2;
    } else if (distancia <= 600) {
      cantidadPeajes = 6;
    } else {
      cantidadPeajes = 8;
    }

    // Para envíos EXPRESS, consideramos ida y vuelta en los peajes
    if (tipoEnvio === 'EXPRESS') {
      cantidadPeajes = cantidadPeajes * 2;
    }

    // Obtenemos el costo unitario del peaje según el tipo de vehículo
    const costoPeajeUnitario = this.obtenerCostoVehiculoPeaje(
      tipoVehiculo,
      config,
    );

    // Calculamos el costo total de peajes
    const totalPeaje = costoPeajeUnitario * cantidadPeajes;

    return {
      cantidadPeajes,
      costoPeaje: costoPeajeUnitario,
      totalPeaje,
    };
  }

  /**
   * Calcula el factor_K basado en la distancia
   */
  private calcularFactorK(
    distancia: number,
    tipoEnvio: string,
    tipoVehiculo: string,
    config: any,
  ): number {
    // Para envío normal, se calcula con el factor de distancia
    if (tipoEnvio !== 'EXPRESS') {
      let factorDistancia = 0;

      if (distancia <= 100) {
        factorDistancia = 0.045; // Factor 0.045 hasta 100 KM
      } else if (distancia <= 250) {
        factorDistancia = 0.04; // Factor 0.04 hasta 250 KM
      } else if (distancia <= 600) {
        factorDistancia = 0.03; // Factor 0.03 hasta 600 KM
      } else {
        factorDistancia = 0.02; // Factor 0.02 desde 600 KM en adelante
      }

      return distancia * factorDistancia;
    }
    // Para envío EXPRESS, se calcula con ida y vuelta y consumo de combustible
    else {
      // Se considera ida y vuelta (distancia * 2)
      const kmTotal = distancia * 2;

      // Se multiplica por el consumo de combustible del vehículo
      const consumoCombustible = this.obtenerConsumoCombustible(
        tipoVehiculo,
        config,
      );

      // Se calcula el costo del combustible: km * consumo * precio
      return kmTotal * consumoCombustible * config.costoGasolina;
    }
  }

  /**
   * Obtiene el consumo de combustible según el tipo de vehículo
   */
  private obtenerConsumoCombustible(tipoVehiculo: string, config: any): number {
    switch (tipoVehiculo) {
      case 'SUSUKI_EECO':
        return config.consumoSusukiEECO;
      case 'MITSUBISHI_L300':
        return config.consumoMitsubishiL300;
      case 'NHR':
        return config.consumoNHR;
      case 'CANTER_CAVA_CORTA':
        return config.consumoCanterCavaCorta;
      case 'CANTER_CAVA_LARGA':
      default:
        return config.consumoCanterCavaLarga;
    }
  }

  /**
   * Calcula el factor_P basado en el algoritmo mostrado en el Excel
   */
  private calcularFactorP(
    peso: number,
    distancia: number,
    config: any,
  ): number {
    let constP1 = 0;
    let constP2 = 0;
    let factorP = 0;

    // Asignar valores de constantes según la distancia
    if (distancia <= 100) {
      // Para hasta 100 km: P1 = 2, P2 = 0.05, rango 1-2 (se resta)
      constP1 = config.constP1Hasta100Km || 2;
      constP2 = config.constP2Hasta100Km || 0.05;

      // Cálculo: P1 - (peso * P2)
      factorP = constP1 - peso * constP2;

      // Aplicar límites: min = 1, max = 2
      factorP = Math.max(1, Math.min(factorP, 2));
    } else if (distancia <= 250) {
      // Para hasta 250 km: P1 = 1.5, P2 = 0.05, rango 0.9-1.5 (se resta)
      constP1 = config.constP1Hasta250Km || 1.5;
      constP2 = config.constP2Hasta250Km || 0.05;

      // Cálculo: P1 - (peso * P2)
      factorP = constP1 - peso * constP2;

      // Aplicar límites: min = 0.9, max = 1.5
      factorP = Math.max(0.9, Math.min(factorP, 1.5));
    } else if (distancia <= 600) {
      // Para hasta 600 km: P1 = 0.5, P2 = 0.03, rango 0.5-1.5 (se suma)
      constP1 = config.constP1Hasta600Km || 0.5;
      constP2 = config.constP2Hasta600Km || 0.03;

      // Cálculo: P1 + (peso * P2)
      factorP = constP1 + peso * constP2;

      // Aplicar límites: min = 0.5, max = 1.5
      factorP = Math.max(0.5, Math.min(factorP, 1.5));
    } else {
      // Para desde 600 km en adelante: P1 = 0.5, P2 = 0.06, rango 0.5-1.5 (se suma)
      constP1 = config.constP1Desde600Km || 0.5;
      constP2 = config.constP2Desde600Km || 0.06;

      // Cálculo: P1 + (peso * P2)
      factorP = constP1 + peso * constP2;

      // Aplicar límites: min = 0.5, max = 1.5
      factorP = Math.max(0.5, Math.min(factorP, 1.5));
    }

    return factorP;
  }

  /**
   * Calcula el costo del envío basado en la nueva fórmula
   */
  private async calcular_costo_envio(
    distancia: number,
    peso: number,
    tipoArticulo: string,
    tipoEnvio: string,
    esSobre: boolean,
    valorDeclarado: number,
    ancho?: number,
    alto?: number,
    largo?: number,
  ): Promise<{
    flete: number;
    tipoVehiculo: string;
    costoHospedaje: number;
    volumen: number;
    cantidadPeajes: number;
    costoPeaje: number;
    totalPeaje: number;
    proteccionEncomienda: number;
    subtotal: number;
    iva: number;
    franqueoPostal: number;
    totalAPagar: number;
  }> {
    const config = await this.configuracionService.obtenerOCrearConfiguracion();

    // Calcular volumen si es un paquete (no es sobre)
    let volumen = 0;
    if (!esSobre && ancho && alto && largo) {
      volumen = this.calcularVolumen(ancho, alto, largo);
    }

    // Determinar tipo de vehículo adecuado
    const tipoVehiculo = this.determinarTipoVehiculo(peso, volumen);

    // Obtener información de peaje según distancia y tipo de vehículo
    const { cantidadPeajes, costoPeaje, totalPeaje } = this.obtenerCostoPeaje(
      distancia,
      tipoVehiculo,
      tipoEnvio, // Añadir tipo de envío
      config,
    );

    // Calcular factor_P - factor por peso
    const factorP = this.calcularFactorP(peso, distancia, config);

    // Calcular factor_K - factor por distancia
    const factorK = this.calcularFactorK(
      distancia,
      tipoEnvio,
      tipoVehiculo,
      config,
    );

    // Calcular costo por peso
    const costoPorPeso = peso * factorP;

    // Calcular protección de encomienda (3.5% del valor declarado)
    const porcentajeProteccion = config.porcentajeProteccion || 3.5; // Por defecto 3.5%
    let proteccionEncomienda = valorDeclarado * (porcentajeProteccion / 100); // Convertir a decimal para el cálculo
    proteccionEncomienda = Math.max(
      proteccionEncomienda,
      config.proteccionMinima || 5.0,
    );

    // Calcular hospedaje si aplica
    let costoHospedaje = 0;
    if (
      distancia > 400 &&
      (tipoEnvio === 'EXPRESS' || config.aplicableHospedaje === 'TODOS')
    ) {
      costoHospedaje = config.costoHospedaje;
    }

    // Calcular subtotal1 SIN incluir la protección
    const subtotal1 = totalPeaje + costoPorPeso + factorK;

    // Calcular el flete sin incluir la protección
    const flete = subtotal1 / 1.3;

    // Calcular subtotal (flete + protección + hospedaje)
    const subtotal = flete + proteccionEncomienda + costoHospedaje;

    // IVA: subtotal * 0.16
    const iva = subtotal * 0.16;

    // Franqueo postal (valor de configuración)
    const franqueoPostal = config.franqueoPostal || 2.0;

    // TOTAL: subtotal + iva + franqueoPostal
    const totalAPagar = subtotal + iva + franqueoPostal;

    return {
      flete,
      tipoVehiculo,
      costoHospedaje,
      volumen,
      cantidadPeajes,
      costoPeaje,
      totalPeaje,
      proteccionEncomienda,
      subtotal,
      iva,
      franqueoPostal,
      totalAPagar,
    };
  }

  async create(createEnvioDto: CreateEnvioDto): Promise<EnvioEntity> {
    const {
      distancia,
      peso = 0,
      tipoArticulo,
      tipoEnvio,
      esSobre,
      ancho,
      alto,
      largo,
      valorDeclarado,
    } = createEnvioDto;

    const {
      flete,
      tipoVehiculo,
      costoHospedaje,
      volumen,
      cantidadPeajes,
      costoPeaje,
      totalPeaje,
      proteccionEncomienda,
      subtotal,
      iva,
      franqueoPostal,
      totalAPagar,
    } = await this.calcular_costo_envio(
      distancia,
      peso,
      tipoArticulo,
      tipoEnvio,
      esSobre,
      valorDeclarado,
      ancho,
      alto,
      largo,
    );

    const nuevoEnvio = this.envioRepository.create({
      ...createEnvioDto,
      volumen,
      tipoVehiculo,
      costoHospedaje,
      flete,
      proteccionEncomienda,
      subtotal,
      iva,
      franqueoPostal,
      totalAPagar,
      cantidadPeajes,
      costoPeaje,
      totalPeaje,
    });

    return this.envioRepository.save(nuevoEnvio);
  }

  async findAll(queryParams: any): Promise<[EnvioEntity[], number]> {
    const {
      page = 1,
      limit = 20,
      trackingNumber,
      status,
      tipoEnvio,
    } = queryParams;
    const queryBuilder = this.envioRepository.createQueryBuilder('envio');

    if (trackingNumber) {
      queryBuilder.andWhere('envio.trackingNumber = :trackingNumber', {
        trackingNumber,
      });
    }

    if (status) {
      queryBuilder.andWhere('envio.status = :status', { status });
    }

    if (tipoEnvio) {
      queryBuilder.andWhere('envio.tipoEnvio = :tipoEnvio', { tipoEnvio });
    }

    queryBuilder.leftJoinAndSelect('envio.user', 'user');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [envios, total] = await queryBuilder.getManyAndCount();

    return [envios, total];
  }

  async findOne(id: number): Promise<EnvioEntity> {
    return this.envioRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findOneUser(idUser: string): Promise<EnvioEntity[]> {
    return await this.envioRepository
      .createQueryBuilder('envio')
      .where('envio.user = :idUser', { idUser })
      .getMany();
  }

  async update(
    id: number,
    updateEnvioDto: UpdateEnvioDto,
  ): Promise<UpdateResult> {
    return await this.envioRepository.update({ id }, updateEnvioDto);
  }

  async remove(id: number): Promise<DeleteResult> {
    return await this.envioRepository.delete(id);
  }

  async calcularEnvio(calculaterDto: CalculaterDto): Promise<EnvioEntity> {
    const {
      distancia,
      peso = 0,
      tipoArticulo,
      tipoEnvio,
      esSobre,
      ancho,
      alto,
      largo,
      valorDeclarado,
    } = calculaterDto;

    const {
      flete,
      tipoVehiculo,
      costoHospedaje,
      volumen,
      cantidadPeajes,
      costoPeaje,
      totalPeaje,
      proteccionEncomienda,
      subtotal,
      iva,
      franqueoPostal,
      totalAPagar,
    } = await this.calcular_costo_envio(
      distancia,
      peso,
      tipoArticulo,
      tipoEnvio,
      esSobre,
      valorDeclarado,
      ancho,
      alto,
      largo,
    );

    const nuevoEnvio = this.envioRepository.create({
      ...calculaterDto,
      volumen,
      tipoVehiculo,
      flete,
      costoHospedaje,
      proteccionEncomienda,
      subtotal,
      iva,
      franqueoPostal,
      totalAPagar,
      cantidadPeajes,
      costoPeaje,
      totalPeaje,
    });

    return nuevoEnvio;
  }

  async crearOrdenEnvio(
    createEnvioDto: CreateEnvioDto,
    id: string,
  ): Promise<EnvioEntity> {
    const user = await this.usersService.findUserByID(id);

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    // Primero verificamos si es un sobre (peso <= 1kg)
    if (createEnvioDto.peso && createEnvioDto.peso <= 1) {
      createEnvioDto.esSobre = true;
    }

    const envio = await this.calcularEnvio(createEnvioDto as any);

    envio.trackingNumber = 'ENV' + Date.now();
    envio.status = 'Por Confirmar';
    envio.user = user;
    const envioGuardado = await this.envioRepository.save(envio);
{/*
     try {
      await this.notificationService.notificarNuevoEnvio({
        user,
        envio: envioGuardado,
      });
      console.log(`📧 Notificación de nuevo envío enviada a ${user.email}`);
    } catch (error) {
      console.error('❌ Error al enviar notificación de nuevo envío:', error);
    }
  
  */}
 

    return envioGuardado;
  }

  async actualizarEstadoOrden(
    id: number,
    updateEnvioDto: UpdateEnvioDto,
  ): Promise<EnvioEntity> {
    const envioActual = await this.findOne(id);
    if (!envioActual) {
      throw new NotFoundException(`Envío con ID "${id}" no encontrado`);
    }

    const estadoAnterior = envioActual.status;

    await this.envioRepository.update(id, updateEnvioDto);
    const envioActualizado = await this.findOne(id);
    if (updateEnvioDto.status && estadoAnterior !== updateEnvioDto.status) {
      try {
        await this.notificationService.notificarCambioEstado(
          {
            user: envioActualizado.user,
            envio: envioActualizado,
          },
          estadoAnterior,
        );

        switch (updateEnvioDto.status) {
          case 'Confirmado':
            await this.notificationService.notificarEnvioEnTransito({
              user: envioActualizado.user,
              envio: envioActualizado,
            });
            console.log(
              `🚛 Notificación de confirmación/tránsito enviada a ${envioActualizado.user.email}`,
            );
            break;

          case 'Entregado':
            await this.notificationService.notificarEnvioEntregado({
              user: envioActualizado.user,
              envio: envioActualizado,
            });
            console.log(
              `✅ Notificación de entrega enviada a ${envioActualizado.user.email}`,
            );
            break;

          default:
            console.log(
              `📧 Notificación de cambio de estado enviada: ${estadoAnterior} → ${updateEnvioDto.status}`,
            );
        }
      } catch (error) {
        console.error(
          '❌ Error al enviar notificación de cambio de estado:',
          error,
        );
      }
    }

    return envioActualizado;
  }

  async findTabuladorWithRelation(id: number): Promise<EnvioEntity> {
    const userRelationTabulador = this.envioRepository
      .createQueryBuilder('envio')
      .leftJoinAndSelect('envio.user', 'user')
      .where('envio.id = :id', { id })
      .getOne();

    if (!userRelationTabulador) {
      throw new NotFoundException(`Envio with ID "${id}" not found`);
    }

    return userRelationTabulador;
  }
}
