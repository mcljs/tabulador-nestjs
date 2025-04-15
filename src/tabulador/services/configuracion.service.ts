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
        // Configuración de hospedaje
        costoHospedaje: 30.0,
        aplicableHospedaje: 'EXPRESS',
        // Consumo de combustible por vehículo
        consumoSusukiEECO: 0.08,
        consumoMitsubishiL300: 0.12,
        consumoNHR: 0.14,
        consumoCanterCavaCorta: 0.18,
        consumoCanterCavaLarga: 0.25,
      });
      await this.configuracionRepository.save(configuracion);
    }

    // Añadimos estas propiedades al objeto de configuración aunque no estén en la BD
    // Esto evita errores si el código intenta acceder a estas propiedades
    configuracion = {
      ...configuracion,
      costoPeajeSusuki: 0.8,
      costoPeajeL300: 0.8,
      costoPeajeNHR: 1.2,
      costoPeajeCanterCorta: 1.2,
      costoPeajeCanterLarga: 1.2,
      costoPeajePlatforma: 1.2,
      costoPeajePitman: 1.2,
      costoPeajeChuto: 6.0,
    };

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