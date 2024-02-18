import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Configuracion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  costoPorKm: number;

  @Column({ type: 'float' })
  costoGasolina: number;

  @Column({ type: 'float' })
  porcentajeProteccion: number;

  @Column({ type: 'float' })
  proteccionMinima: number;

  @Column({ type: 'float' })
  franqueoPostal: number;
}
