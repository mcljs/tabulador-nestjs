import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'configuracion' })
export class Configuracion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float', default: 0.003 })
  costoPorKm: number;

  @Column({ type: 'float', default: 0.49 })
  costoGasolina: number;

  @Column({ type: 'float', default: 0.035 })
  porcentajeProteccion: number;

  @Column({ type: 'float', default: 5.0 })
  proteccionMinima: number;

  @Column({ type: 'float', default: 2.0 })
  franqueoPostal: number;

  @Column({ type: 'float', default: 30.0 })
  costoHospedaje: number;

  @Column({ type: 'varchar', default: 'EXPRESS' })
  aplicableHospedaje: string;

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

  // Costos de peaje por tipo de vehículo
  @Column({ type: 'float', default: 0.8 })
  costoPeajeSusuki: number;

  @Column({ type: 'float', default: 0.8 })
  costoPeajeL300: number;

  @Column({ type: 'float', default: 1.2 })
  costoPeajeNHR: number;

  @Column({ type: 'float', default: 1.2 })
  costoPeajeCanterCorta: number;

  @Column({ type: 'float', default: 1.2 })
  costoPeajeCanterLarga: number;

  @Column({ type: 'float', default: 1.2 })
  costoPeajePlatforma: number;

  @Column({ type: 'float', default: 1.2 })
  costoPeajePitman: number;

  @Column({ type: 'float', default: 6.0 })
  costoPeajeChuto: number;

  // Valores de constantes para cálculos
  @Column({ type: 'float', default: 0.05 })
  constP2Hasta100Km: number;

  @Column({ type: 'float', default: 2.0 })
  constP1Hasta100Km: number;

  @Column({ type: 'float', default: 0.05 })
  constP2Hasta250Km: number;

  @Column({ type: 'float', default: 1.5 })
  constP1Hasta250Km: number;

  @Column({ type: 'float', default: 0.03 })
  constP2Hasta600Km: number;

  @Column({ type: 'float', default: 0.5 })
  constP1Hasta600Km: number;

  @Column({ type: 'float', default: 0.06 })
  constP2Desde600Km: number;

  @Column({ type: 'float', default: 0.5 })
  constP1Desde600Km: number;
}
