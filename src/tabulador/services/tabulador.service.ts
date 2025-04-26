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
  private obtenerCostoPeaje(distancia: number, tipoVehiculo: string, config: any): { cantidadPeajes: number, costoPeaje: number, totalPeaje: number } {
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
    
    // Obtenemos el costo unitario del peaje según el tipo de vehículo
    const costoPeajeUnitario = this.obtenerCostoVehiculoPeaje(tipoVehiculo, config);
    
    // Calculamos el costo total de peajes
    const totalPeaje = costoPeajeUnitario * cantidadPeajes;
    
    return { 
      cantidadPeajes, 
      costoPeaje: costoPeajeUnitario,
      totalPeaje
    };
  }

  /**
   * Calcula el factor_K basado en la distancia
   */
  private calcularFactorK(distancia: number, tipoEnvio: string, tipoVehiculo: string, config: any): number {
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

    // Para envío normal, solo se considera el km de ida
    let kmAConsiderar = distancia;
    
    // Para envío express, se considera ida y vuelta
    if (tipoEnvio === 'EXPRESS') {
      kmAConsiderar = distancia * 2;
      
      // Además, para express se multiplica por el consumo de combustible del vehículo
      const consumoCombustible = this.obtenerConsumoCombustible(tipoVehiculo, config);
      return kmAConsiderar * consumoCombustible * config.costoGasolina;
    }
    
    // Para envío normal, se calcula con el factor de distancia
    return kmAConsiderar * factorDistancia;
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
   * Calcula el factor_P basado en el nuevo algoritmo
   */
  private calcularFactorP(peso: number, distancia: number, config: any): number {
    let constP1 = 0;
    let constP2 = 0;
    
    // Asignar valores de constantes según la distancia
    if (distancia <= 100) {
      constP1 = config.constP1Hasta100Km;
      constP2 = config.constP2Hasta100Km;
    } else if (distancia <= 250) {
      constP1 = config.constP1Hasta250Km;
      constP2 = config.constP2Hasta250Km;
    } else if (distancia <= 600) {
      constP1 = config.constP1Hasta600Km;
      constP2 = config.constP2Hasta600Km;
    } else {
      constP1 = config.constP1Desde600Km;
      constP2 = config.constP2Desde600Km;
    }
    
    // Calcular factor_P según la fórmula: const_P1 - (kg * const_P2)
    let factorP = constP1 - (peso * constP2);
    
    // Aplicar mínimos y máximos según distancia
    if (distancia <= 100) {
      // Rango 1-2
      factorP = Math.max(1, Math.min(factorP, 2));
    } else if (distancia <= 250) {
      // Rango 0.9-1.5
      factorP = Math.max(0.9, Math.min(factorP, 1.5));
    } else {
      // Rango 0.5-1.5
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
      config
    );
    
    // Calcular factor_P - factor por peso
    const factorP = this.calcularFactorP(peso, distancia, config);
    
    // Calcular factor_K - factor por distancia
    const factorK = this.calcularFactorK(distancia, tipoEnvio, tipoVehiculo, config);
    
    // Calcular costo por peso
    const costoPorPeso = peso * factorP;
    
    // Calcular protección de encomienda (3.5% del valor declarado)
    const porcentajeProteccion = config.porcentajeProteccion || 0.035; // Por defecto 3.5%
    let proteccionEncomienda = valorDeclarado * porcentajeProteccion;
    proteccionEncomienda = Math.max(proteccionEncomienda, config.proteccionMinima || 5.0);
    
    // Calcular hospedaje si aplica
    let costoHospedaje = 0;
    if (distancia > 400 &&
       (tipoEnvio === 'EXPRESS' || config.aplicableHospedaje === 'TODOS')) {
      costoHospedaje = config.costoHospedaje;
    }
    
    // SUBT1: peaje + (kg * fact_P) + fact_K + prot
    const subtotal1 = totalPeaje + costoPorPeso + factorK + proteccionEncomienda;
    
    // SUB2: (sub1/1.3) + prot
    const subtotal2 = (subtotal1 / 1.3) + proteccionEncomienda;
    
    // Subtotal ajustado según fórmula
    const subtotal = subtotal2 + costoHospedaje;
    
    // IVA: subtotal * 0.16
    const iva = subtotal * 0.16;
    
    // Franqueo postal (valor de configuración)
    const franqueoPostal = config.franqueoPostal || 2.0;
    
    // TOTAL: subtotal + iva + franqueoPostal
    const totalAPagar = subtotal + iva + franqueoPostal;
    
    // Para mantener compatibilidad con el sistema anterior, 
    // asignamos el subtotal2 al "flete"
    const flete = subtotal2;
    
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
      totalAPagar
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
      totalAPagar
    } = await this.calcular_costo_envio(
      distancia,
      peso,
      tipoArticulo,
      tipoEnvio,
      esSobre,
      valorDeclarado,
      ancho,
      alto,
      largo
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
      totalPeaje
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
      totalAPagar
    } = await this.calcular_costo_envio(
      distancia,
      peso,
      tipoArticulo,
      tipoEnvio,
      esSobre,
      valorDeclarado,
      ancho,
      alto,
      largo
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
      totalPeaje
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