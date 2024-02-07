import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from '../services/auth.service';
import { IAuthLogin } from '../interfaces/auth.interface';
import { AuthGuard } from '../guards/auth.guard';
import { UsersService } from 'src/users/services/users.service';
import { GetUser } from '../decorators/user.decorator';
import { UsersEntity } from 'src/users/entities/users.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() { username, password }: IAuthLogin) {
    const userValidate = await this.authService.userValidate(
      username,
      password,
    );

    const jwt = await this.authService.generateJWT(userValidate);

    return jwt;
  }

  @UseGuards(AuthGuard)
  @Get('/me')
  getProfile(@Request() req) {
    // Ahora puedes acceder a req.user que fue establecido por tu AuthGuard
    const user = req.user;
    const { password, ...result } = user; // Excluye la contraseña u otros datos sensibles
    return result;
  }
}