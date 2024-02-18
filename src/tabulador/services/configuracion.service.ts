import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuracion } from '../entities/configuracion.entity';
import { CreateConfiguracionDto } from '../dto/create-configuracion.dto';

@Injectable()
export class ConfiguracionService {
  constructor(
    @InjectRepository(Configuracion)
    private readonly configuracionRepository: Repository<Configuracion>,
  ) {}

  async obtenerOCrearConfiguracion(): Promise<Configuracion> {
    let configuracion = await this.configuracionRepository.findOne({
      where: { id: 1 },
    });

    if (!configuracion) {
      configuracion = this.configuracionRepository.create({
        id: 1,
        costoPorKm: 0.003,
        costoGasolina: 0.49,
        porcentajeProteccion: 0.01,
        proteccionMinima: 5.0,
        franqueoPostal: 2.0,
      });
      await this.configuracionRepository.save(configuracion);
    }

    return configuracion;
  }

  async actualizarConfiguracion(
    id: number,
    nuevaConfiguracion: CreateConfiguracionDto,
  ): Promise<Configuracion> {
    await this.configuracionRepository.update(id, nuevaConfiguracion);
    return this.obtenerOCrearConfiguracion();
  }
}
