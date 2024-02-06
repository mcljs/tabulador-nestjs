import { UsersEntity } from 'src/users/entities/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class EnvioEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  distancia!: number;

  @Column({ nullable: true })
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

  @Column({ type: 'float' })
  costoTotal: number;

  @JoinColumn({
    name: 'user_id',
  })
  @ManyToOne(() => UsersEntity, (user) => user.tabuladorIncludes)
  user: UsersEntity;
}
