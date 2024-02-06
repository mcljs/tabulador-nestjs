// src/tabulador/tabulador.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TabuladorService } from '../services/tabulador.service';
import { CreateEnvioDto, UpdateEnvioDto } from '../dto/create-envio.dto';

@Controller('envios')
export class TabuladorController {
  constructor(private readonly tabuladorService: TabuladorService) {}

  @Post('calcularEnvio')
  calcularEnvio(@Body() createEnvioDto: CreateEnvioDto) {
    return this.tabuladorService.calcularEnvio(createEnvioDto);
  }

  @Post('crearOrdenEnvio')
  crearOrdenEnvio(@Body() createEnvioDto: CreateEnvioDto) {
    return this.tabuladorService.crearOrdenEnvio(createEnvioDto);
  }

  @Patch('actualizarEstadoOrden/:id')
  actualizarEstadoOrden(
    @Param('id') id: string,
    @Body() updateEnvioDto: UpdateEnvioDto,
  ) {
    return this.tabuladorService.actualizarEstadoOrden(+id, updateEnvioDto);
  }

  @Get()
  findAll() {
    return this.tabuladorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tabuladorService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tabuladorService.remove(+id);
  }
}
