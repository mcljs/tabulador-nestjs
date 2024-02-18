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

  private async calcular_costo_envio(
    distancia: number,
    peso: number,
    tipoArticulo: string,
  ): Promise<number> {
    const config = await this.configuracionService.obtenerOCrearConfiguracion();
    let costo_por_km = config.costoPorKm || 0.003;
    const costoGasolina = config.costoGasolina || 0.49;

    if (peso <= 15) {
      costo_por_km += 0.03;
    } else if (peso > 15 && peso <= 50) {
      costo_por_km += 0.05;
    } else if (peso > 50 && peso <= 100) {
      costo_por_km += 0.1;
    } else {
      costo_por_km += 0.15;
    }

    let recargo = 0;
    if (peso > 7 || tipoArticulo === 'Mercancia') {
      recargo = 12.0;
    } else if (tipoArticulo === 'Documentos') {
      recargo = 8.0;
    }

    const costoGasolinaAdicional = distancia * costoGasolina;

    return distancia * costo_por_km + recargo * 2 + costoGasolinaAdicional;
  }

  async create(createEnvioDto: CreateEnvioDto): Promise<EnvioEntity> {
    const costo_total = await this.calcular_costo_envio(
      createEnvioDto.distancia,
      createEnvioDto.peso,
      createEnvioDto.tipoArticulo,
    );

    const nuevoEnvio = this.envioRepository.create({
      ...createEnvioDto,
      totalAPagar: costo_total,
    });

    return this.envioRepository.save(nuevoEnvio);
  }

  async findAll(queryParams: any): Promise<[EnvioEntity[], number]> {
    const { page = 1, limit = 20, trackingNumber, status } = queryParams;
    const queryBuilder = this.envioRepository.createQueryBuilder('envio');

    if (trackingNumber) {
      queryBuilder.andWhere('envio.trackingNumber = :trackingNumber', {
        trackingNumber,
      });
    }

    if (status) {
      queryBuilder.andWhere('envio.status = :status', { status });
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
    const flete = await this.calcular_costo_envio(
      calculaterDto.distancia,
      calculaterDto.peso,
      calculaterDto.tipoArticulo,
    );

    const config = await this.configuracionService.obtenerOCrearConfiguracion();
    const porcentajeProteccion = config.porcentajeProteccion || 0.01;
    const proteccionMinima = config.proteccionMinima || 5.0;
    const franqueoPostal = config.franqueoPostal || 2.0;

    let proteccionEncomienda =
      calculaterDto.valorDeclarado * porcentajeProteccion;
    proteccionEncomienda = Math.max(proteccionEncomienda, proteccionMinima);

    const subtotal = flete + proteccionEncomienda;
    const iva = subtotal * 0.16;
    const totalAPagar = subtotal + iva + franqueoPostal;

    const nuevoEnvio = this.envioRepository.create({
      ...calculaterDto,
      flete,
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
      throw new NotFoundException(`User with ID "${user.id}" not found`);
    }
    const envio = await this.calcularEnvio(createEnvioDto);
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
