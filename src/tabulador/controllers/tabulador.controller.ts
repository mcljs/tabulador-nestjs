// src/tabulador/tabulador.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { TabuladorService } from '../services/tabulador.service';
import { CreateEnvioDto, UpdateEnvioDto } from '../dto/create-envio.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('envios')
@UseGuards(AuthGuard)
export class TabuladorController {
  constructor(private readonly tabuladorService: TabuladorService) {}

  @Post('calcularEnvio')
  calcularEnvio(@Body() createEnvioDto: CreateEnvioDto) {
    return this.tabuladorService.calcularEnvio(createEnvioDto);
  }

  @Post('crearOrdenEnvio')
  crearOrdenEnvio(
    @Body() createEnvioDto: CreateEnvioDto,
    @Req() request: Request,
  ) {
    const { idUser } = request;
    return this.tabuladorService.crearOrdenEnvio(createEnvioDto, idUser);
  }

  @Patch('actualizarEstadoOrden/:id')
  actualizarEstadoOrden(
    @Param('id') id: string,
    @Body() updateEnvioDto: UpdateEnvioDto,
  ) {
    return this.tabuladorService.actualizarEstadoOrden(+id, updateEnvioDto);
  }

  @Get('all')
  async findAll() {
    return await this.tabuladorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tabuladorService.findOne(+id);
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
