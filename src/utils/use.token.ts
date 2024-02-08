import * as jwt from 'jsonwebtoken';
import { IUseToken, IAuthTokenResult } from '../auth/interfaces/auth.interface';

export const useToken = (token: string): IUseToken | string => {
  try {
    const decode = jwt.decode(token) as IAuthTokenResult;

    const currentDate = new Date();
    const expiresDate = new Date(decode.exp);

    return {
      firstName: decode.firstName,
      lastName: decode.lastName,
      email: decode.email,
      city: decode.city,
      sub: decode.sub,
      role: decode.role,
      isExpired: Number(expiresDate) <= Number(currentDate) / 1000,
    };
  } catch (error) {
    return 'Token is invalid';
  }
};
