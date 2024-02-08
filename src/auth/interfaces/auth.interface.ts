import { JwtPayload } from 'jsonwebtoken';

import { ROLES } from '../../config/roles';

export interface IPayloadToken {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  sub: string;
  role: ROLES;
}

export interface ISingJWT {
  payload: JwtPayload;
  secret: string;
  expires: number | string;
}

export interface IAuthLogin {
  username: string;
  password: string;
}

export interface IAuthTokenResult {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  role: string;
  sub: string;
  iat: number;
  exp: number;
}

export interface IUseToken {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  role: string;
  sub: string;
  isExpired: boolean;
}
