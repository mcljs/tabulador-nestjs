import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { UsersService } from '../../users/services/users.service';
import { ErrorManager } from '../../utils/http.manager';
import { ISingJWT, IPayloadToken } from '../interfaces/auth.interface';
import { UsersEntity } from '../../users/entities/users.entity';

@Injectable()
export class AuthService {
  constructor(private readonly userServices: UsersService) {}

  public async userValidate(usernameOrEmail: string, password: string) {
    try {
      const userByEmailOrUsername = await this.userServices.findBy(
        usernameOrEmail,
      );

      const isPasswordValid = await bcrypt.compare(
        password,
        userByEmailOrUsername.password,
      );

      if (!isPasswordValid) {
        throw new ErrorManager({
          type: 'UNAUTHORIZED',
          message: 'Password incorrect try again',
        });
      }

      return userByEmailOrUsername;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getCurrentUser(userId: string): Promise<UsersEntity | null> {
    try {
      return await this.userServices.findUserByID(userId);
    } catch (error) {
      throw new Error('User not found');
    }
  }

  public async signJWT({ payload, secret, expires }: ISingJWT) {
    return jwt.sign(payload, secret, { expiresIn: expires });
  }

  public async generateJWT(user: UsersEntity): Promise<any> {
    const getUser = await this.userServices.findUserByID(user.id);

    const payload: IPayloadToken = {
      firstName: getUser.firstName,
      lastName: getUser.lastName,
      email: getUser.email,
      document_type: getUser.document_type,
      document_number: getUser.document_number,
      city: getUser.city,
      role: getUser.role,
      sub: getUser.id,
    };

    return {
      accessToken: await this.signJWT({
        payload,
        secret: process.env.JWT_SECRET,
        expires: '1h',
      }),
      user,
    };
  }
}
