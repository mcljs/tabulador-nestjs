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

@Injectable()
export class TabuladorService {
  constructor(
    private readonly configuracionService: ConfiguracionService,
    @InjectRepository(EnvioEntity)
    private readonly envioRepository: Repository<EnvioEntity>,
    private readonly usersService: UsersService,
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
    } else if (volumen <= 5) { // Asumiendo capacidad de NHR
      tipoVehiculo = 'NHR';
    } else if (volumen <= 8) { // Asumiendo capacidad de Canter Cava Corta
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
   * Obtiene el consumo de combustible según el tipo de vehículo
   */
  private obtenerConsumoCombustible(
    tipoVehiculo: string,
    config: any,
  ): number {
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
   * Calcula el costo del envío basado en las nuevas reglas
   */
  private async calcular_costo_envio(
    distancia: number,
    peso: number,
    tipoArticulo: string,
    tipoEnvio: string,
    esSobre: boolean,
    ancho?: number,
    alto?: number, 
    largo?: number,
  ): Promise<{ flete: number; tipoVehiculo: string; costoHospedaje: number; volumen: number }> {
    const config = await this.configuracionService.obtenerOCrearConfiguracion();
    
    // Calcular volumen si es un paquete (no es sobre)
    let volumen = 0;
    if (!esSobre && ancho && alto && largo) {
      volumen = this.calcularVolumen(ancho, alto, largo);
    }
    
    // Determinar tipo de vehículo adecuado
    const tipoVehiculo = this.determinarTipoVehiculo(peso, volumen);
    
    // Obtener consumo de combustible según el vehículo
    const consumoCombustible = this.obtenerConsumoCombustible(tipoVehiculo, config);
    
    // Cálculo del costo de combustible
    const costoCombustible = distancia * consumoCombustible * config.costoGasolina;
    
    // Costo base según el tipo de artículo
    let costoBase = 0;
    if (esSobre) {
      costoBase = 8.0; // Sobre (peso <= 1kg)
    } else if (tipoArticulo === 'Mercancia') {
      costoBase = 12.0;
    } else {
      costoBase = 8.0; // Documentos que no son sobre
    }
    
    // Factor multiplicador según tipo de envío
    const factorTipoEnvio = tipoEnvio === 'EXPRESS' ? 1.5 : 1.0;
    
    // Calcular costo de hospedaje si aplica
    let costoHospedaje = 0;
    if (distancia > 400 &&
       (tipoEnvio === 'EXPRESS' || config.aplicableHospedaje === 'TODOS')) {
      costoHospedaje = config.costoHospedaje;
    }
    
    // Cálculo del flete final
    const flete = (costoCombustible + costoBase * 2) * factorTipoEnvio;
    
    return { 
      flete, 
      tipoVehiculo,
      costoHospedaje,
      volumen
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
      valorDeclarado 
    } = createEnvioDto;
    
    const { flete, tipoVehiculo, costoHospedaje, volumen } = await this.calcular_costo_envio(
      distancia,
      peso,
      tipoArticulo,
      tipoEnvio,
      esSobre,
      ancho,
      alto,
      largo
    );
  
    // Obtenemos la configuración para calcular valores adicionales
    const config = await this.configuracionService.obtenerOCrearConfiguracion();
    const porcentajeProteccion = config.porcentajeProteccion || 0.01;
    const proteccionMinima = config.proteccionMinima || 5.0;
    const franqueoPostal = config.franqueoPostal || 2.0;
  
    // Calculamos la protección igual que en calcularEnvio
    let proteccionEncomienda = valorDeclarado * porcentajeProteccion;
    proteccionEncomienda = Math.max(proteccionEncomienda, proteccionMinima);
  
    // Calculamos el subtotal, IVA y total de la misma manera
    const subtotal = flete + proteccionEncomienda + costoHospedaje;
    const iva = subtotal * 0.16;
    const totalAPagar = subtotal + iva + franqueoPostal;
  
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
    });
  
    return this.envioRepository.save(nuevoEnvio);
  }

  async findAll(queryParams: any): Promise<[EnvioEntity[], number]> {
    const { page = 1, limit = 20, trackingNumber, status, tipoEnvio } = queryParams;
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
      valorDeclarado 
    } = calculaterDto;

    const { flete, tipoVehiculo, costoHospedaje, volumen } = await this.calcular_costo_envio(
      distancia,
      peso,
      tipoArticulo,
      tipoEnvio,
      esSobre,
      ancho,
      alto,
      largo
    );

    const config = await this.configuracionService.obtenerOCrearConfiguracion();
    const porcentajeProteccion = config.porcentajeProteccion || 0.01;
    const proteccionMinima = config.proteccionMinima || 5.0;
    const franqueoPostal = config.franqueoPostal || 2.0;

    let proteccionEncomienda = valorDeclarado * porcentajeProteccion;
    proteccionEncomienda = Math.max(proteccionEncomienda, proteccionMinima);

    const subtotal = flete + proteccionEncomienda + costoHospedaje;
    const iva = subtotal * 0.16;
    const totalAPagar = subtotal + iva + franqueoPostal;

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
    return this.envioRepository.save(envio);
  }

  async actualizarEstadoOrden(
    id: number,
    updateEnvioDto: UpdateEnvioDto,
  ): Promise<EnvioEntity> {
    await this.envioRepository.update(id, updateEnvioDto);

    return this.findOne(id);
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