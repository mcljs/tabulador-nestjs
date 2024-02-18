import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfiguracionService } from './services/configuracion.service';
import { Configuracion } from './entities/configuracion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Configuracion])],
  providers: [ConfiguracionService],
  exports: [ConfiguracionService],
})
export class ConfiguracionModule {}
