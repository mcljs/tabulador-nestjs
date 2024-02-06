import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Envio } from '../entities/envio.entity';
import { CreateEnvioDto, UpdateEnvioDto } from '../dto/create-envio.dto';

@Injectable()
export class TabuladorService {
  constructor(
    @InjectRepository(Envio)
    private readonly envioRepository: Repository<Envio>,
  ) {}

  private calcular_costo_envio(
    distancia: number,
    peso: number,
    tipoArticulo: string,
  ): number {
    let costo_por_km = 0.003;

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
    if (tipoArticulo === 'Mercancia') {
      recargo = 12.0;
    } else if (tipoArticulo === 'Documentos') {
      recargo = 8.0;
    }

    return distancia * costo_por_km + recargo * 2;
  }

  async create(createEnvioDto: CreateEnvioDto): Promise<Envio> {
    const costo_total = this.calcular_costo_envio(
      createEnvioDto.distancia,
      createEnvioDto.peso,
      createEnvioDto.tipoArticulo,
    );

    const nuevoEnvio = this.envioRepository.create({
      ...createEnvioDto,
      costoTotal: costo_total,
    });

    return this.envioRepository.save(nuevoEnvio);
  }

  async findAll(): Promise<Envio[]> {
    return this.envioRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<Envio> {
    return this.envioRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async update(id: number, updateEnvioDto: UpdateEnvioDto): Promise<Envio> {
    await this.envioRepository.update({ id }, updateEnvioDto);
    return this.envioRepository.findOne({
      where: { id },
    });
  }
  async remove(id: number): Promise<void> {
    await this.envioRepository.delete(id);
  }

  async calcularEnvio(createEnvioDto: CreateEnvioDto): Promise<Envio> {
    const flete = this.calcular_costo_envio(
      createEnvioDto.distancia,
      createEnvioDto.peso,
      createEnvioDto.tipoArticulo,
    );

    const porcentajeProteccion = 0.01;
    let proteccionEncomienda =
      createEnvioDto.valorDeclarado * porcentajeProteccion;
    const proteccionMinima = 5.0;
    proteccionEncomienda = Math.max(proteccionEncomienda, proteccionMinima);

    const subtotal = flete + proteccionEncomienda;
    const iva = subtotal * 0.16;
    const franqueoPostal = 2.0;
    const totalAPagar = subtotal + iva + franqueoPostal;

    const nuevoEnvio = this.envioRepository.create({
      ...createEnvioDto,
      flete,
      proteccionEncomienda,
      subtotal,
      iva,
      franqueoPostal,
      totalAPagar,
    });

    return this.envioRepository.save(nuevoEnvio);
  }

  async crearOrdenEnvio(createEnvioDto: CreateEnvioDto): Promise<Envio> {
    const envio = await this.calcularEnvio(createEnvioDto);

    envio.trackingNumber = 'ENV' + Date.now();
    envio.status = 'En proceso';
    return this.envioRepository.save(envio);
  }

  async actualizarEstadoOrden(
    id: number,
    updateEnvioDto: UpdateEnvioDto,
  ): Promise<Envio> {
    await this.envioRepository.update(id, updateEnvioDto);

    return this.findOne(id);
  }
}
