// src/tabulador/tabulador.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { TabuladorService } from '../services/tabulador.service';
import { ConfiguracionService } from '../services/configuracion.service';
import {
  CalculaterDto,
  CreateEnvioDto,
  UpdateEnvioDto,
} from '../dto/create-envio.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { PublicAccess } from 'src/auth/decorators/public.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateConfiguracionDto } from '../dto/update-configuracion.dto';

@Controller('envios')
@UseGuards(AuthGuard, RolesGuard)
export class TabuladorController {
  constructor(
    private readonly tabuladorService: TabuladorService,
    private readonly configuracionService: ConfiguracionService,
  ) {}
  @PublicAccess()
  @Post('calcularEnvio')
  calcularEnvio(@Body() calculaterDto: CalculaterDto) {
    return this.tabuladorService.calcularEnvio(calculaterDto);
  }

  @Post('crearOrdenEnvio')
  crearOrdenEnvio(
    @Body() createEnvioDto: CreateEnvioDto,
    @Req() request: Request,
  ) {
    const { idUser } = request;
    return this.tabuladorService.crearOrdenEnvio(createEnvioDto, idUser);
  }

  @Roles('ADMIN')
  @Patch('actualizarEstadoOrden/:id')
  actualizarEstadoOrden(
    @Param('id') id: number,
    @Body() updateEnvioDto: UpdateEnvioDto,
  ) {
    return this.tabuladorService.actualizarEstadoOrden(+id, updateEnvioDto);
  }

  @Roles('ADMIN')
  @Get('configuracion')
  obtenerConfiguracionActual() {
    return this.configuracionService.obtenerOCrearConfiguracion();
  }

  @Roles('ADMIN')
  @Patch('configuracion')
  actualizarConfiguracion(
    @Body() updateConfiguracionDto: UpdateConfiguracionDto,
  ) {
    return this.configuracionService.actualizarConfiguracion(
      1,
      updateConfiguracionDto,
    );
  }

  @Roles('ADMIN')
  @Get('all')
  async findAll(@Query() queryParams: any) {
    return await this.tabuladorService.findAll(queryParams);
  }

  @Get('user')
  findOneUser(@Req() request: Request) {
    const { idUser } = request;
    return this.tabuladorService.findOneUser(idUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tabuladorService.remove(+id);
  }

  @Get('relation/:id')
  getRelation(@Param('id') id: string) {
    return this.tabuladorService.findTabuladorWithRelation(+id);
  }
}
