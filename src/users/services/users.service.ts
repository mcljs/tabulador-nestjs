import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UsersEntity } from '../entities/users.entity';
import { AssignedProjectDTO, UserDTO, UserUpdateDTO } from '../dto/users.dto';
import { ErrorManager } from '../../utils/http.manager';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
  ) {}

  public async createUser(body: UserDTO): Promise<UsersEntity | null> {
    try {
      const findByEmailAndUserName = await this.exitUsernameOrEmail(
        body.username,
        body.email,
      );
      if (findByEmailAndUserName) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Username or Email already exists',
        });
      }
      body.password = await bcrypt.hash(
        body.password,
        Number(process.env.HASH_SALT),
      );
      return await this.userRepository.save(body);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async exitUsernameOrEmail(
    username: string,
    email: string,
  ): Promise<boolean> {
    // eslint-disable-next-line no-useless-catch
    try {
      const userFindUsernameOrEmail = await this.userRepository
        .createQueryBuilder('user')
        .where('user.username = :username', { username })
        .orWhere('user.email = :email', { email })
        .getOne();

      if (userFindUsernameOrEmail) {
        return true;
      }
      return false;
    } catch (error) {
      throw ErrorManager.createSignatureError((error as Error).message);
    }
  }

  public async findUsers(): Promise<UsersEntity[] | null> {
    try {
      const users: UsersEntity[] = await this.userRepository.find();
      if (users.length === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Not exits users list',
        });
      }
      return users;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findUserByID(id: string): Promise<UsersEntity | null> {
    try {
      const userByID = await this.userRepository
        .createQueryBuilder('user')
        .where({ id })
        .getOne();
      if (!userByID) {
        throw new ErrorManager({
          type: 'UNAUTHORIZED',
          message: 'Not exits user by ID',
        });
      }
      return userByID;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy(usernameOrEmail: string): Promise<UsersEntity | null> {
    try {
      const userFindByUsernameOrEmail = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where((qb) => {
          qb.where('user.email = :usernameOrEmail', {
            usernameOrEmail,
          }).orWhere('user.username = :usernameOrEmail', { usernameOrEmail });
        })
        .getOne();

      if (!userFindByUsernameOrEmail) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Not Found by Username or Email',
        });
      }
      return userFindByUsernameOrEmail;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateUser(
    id: string,
    body: UserUpdateDTO,
  ): Promise<UpdateResult | null> {
    try {
      const userUpdate: UpdateResult = await this.userRepository.update(
        id,
        body,
      );
      if (userUpdate.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Not update user',
        });
      }
      return userUpdate;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteUser(id: string): Promise<DeleteResult | null> {
    try {
      const userDelete: DeleteResult = await this.userRepository.delete(id);
      if (userDelete.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Not delete user',
        });
      }
      return userDelete;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
