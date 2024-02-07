import { Column, Entity, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';

import { BaseEntity } from '../../config/base.entity';
import { ROLES } from '../../config/roles';
import { IUser } from '../../interfaces/user.interface';
import { UsersProjectsEntity } from './usersProjects.entity';
import { EnvioEntity } from 'src/tabulador/entities/envio.entity';

@Entity({ name: 'users' })
export class UsersEntity extends BaseEntity implements IUser {
  @Column({ unique: true })
  email: string;
  @Column({ unique: true })
  username: string;
  @Column()
  firstName: string;
  @Column()
  lastName: string;
  @Column()
  phone: string;
  @Column()
  dateOfBirth: string;
  @Column()
  city: string;
  @Column()
  @Exclude()
  password: string;
  @Column({ type: 'enum', enum: ROLES })
  role: ROLES;

  @OneToMany(() => UsersProjectsEntity, (usersProjects) => usersProjects.user)
  projectsIncludes: UsersProjectsEntity[];

  @OneToMany(() => EnvioEntity, (usersTabulador) => usersTabulador.user)
  tabuladorIncludes: EnvioEntity[];
}
