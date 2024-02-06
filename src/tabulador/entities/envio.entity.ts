import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Envio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  distancia: number;

  @Column({ nullable: true })
  peso: number;

  @Column()
  tipo_articulo: string;

  @Column({ type: 'float' })
  valorDeclarado: number;

  @Column({ type: 'float' })
  flete: number;

  @Column({ type: 'float' })
  proteccionEncomienda: number;

  @Column({ type: 'float' })
  subtotal: number;

  @Column({ type: 'float' })
  iva: number;

  @Column({ type: 'float' })
  franqueoPostal: number;

  @Column({ type: 'float' })
  totalAPagar: number;

  @Column()
  trackingNumber: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  ruteInitial?: string;

  @Column({ nullable: true })
  ruteFinish?: string;

  @Column()
  tipoArticulo: string;

  @Column({ type: 'float' })
  costoTotal: number;
}
