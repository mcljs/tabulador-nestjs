import { UsersEntity } from 'src/users/entities/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class EnvioEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  distancia!: number;

  @Column({ type: 'float', nullable: true }) // Cambiado de integer a float
  peso!: number;

  @Column({ type: 'float' })
  valorDeclarado!: number;

  @Column({ type: 'float' })
  flete!: number;

  @Column({ type: 'float' })
  proteccionEncomienda!: number;

  @Column({ type: 'float' })
  subtotal!: number;

  @Column({ type: 'float' })
  iva!: number;

  @Column({ type: 'float' })
  franqueoPostal!: number;

  @Column({ type: 'float' })
  totalAPagar!: number;

  @Column()
  trackingNumber!: string;

  @Column()
  status!: string;

  @Column({ nullable: true })
  ruteInitial?: string;

  @Column({ nullable: true })
  ruteFinish?: string;

  @Column()
  tipoArticulo!: string;

  @JoinColumn({
    name: 'user_id',
  })
  @ManyToOne(() => UsersEntity, (user) => user.tabuladorIncludes)
  user: UsersEntity;

  // Nuevos campos según los requerimientos:

  @Column({ type: 'enum', enum: ['NORMAL', 'EXPRESS'], default: 'NORMAL' })
  tipoEnvio!: string;

  @Column({ type: 'boolean', default: false })
  esSobre!: boolean;

  // Dimensiones para cálculo de volumen
  @Column({ type: 'float', nullable: true })
  ancho?: number;

  @Column({ type: 'float', nullable: true })
  alto?: number;

  @Column({ type: 'float', nullable: true })
  largo?: number;

  @Column({ type: 'float', nullable: true })
  volumen?: number;

  // Vehículo asignado al envío
  @Column({ nullable: true })
  tipoVehiculo?: string;

  // Costo de hospedaje para distancias mayores a 400km
  @Column({ type: 'float', default: 0 })
  costoHospedaje!: number;
  
  // Campos para peajes
  @Column({ type: 'int', default: 0 })
  cantidadPeajes!: number;
  
  @Column({ type: 'float', default: 0 })
  costoPeaje!: number;
  
  @Column({ type: 'float', default: 0 })
  totalPeaje!: number;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt: Date;
}