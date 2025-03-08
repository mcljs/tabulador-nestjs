import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Configuracion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float', default: 0.003 })
  costoPorKm: number;

  @Column({ type: 'float', default: 0.49 })
  costoGasolina: number;

  @Column({ type: 'float', default: 0.01 })
  porcentajeProteccion: number;

  @Column({ type: 'float', default: 5.0 })
  proteccionMinima: number;

  @Column({ type: 'float', default: 2.0 })
  franqueoPostal: number;

  // Nuevos campos requeridos
  
  // Configuración para hospedaje
  @Column({ type: 'float', default: 30.0 })
  costoHospedaje: number;

  @Column({ type: 'enum', enum: ['EXPRESS', 'TODOS'], default: 'EXPRESS' })
  aplicableHospedaje: string;

  // Consumo de combustible por vehículo (en Lts/Km)
  @Column({ type: 'float', default: 0.08 })
  consumoSusukiEECO: number;

  @Column({ type: 'float', default: 0.12 })
  consumoMitsubishiL300: number;

  @Column({ type: 'float', default: 0.14 })
  consumoNHR: number;

  @Column({ type: 'float', default: 0.18 })
  consumoCanterCavaCorta: number;

  @Column({ type: 'float', default: 0.25 })
  consumoCanterCavaLarga: number;
}