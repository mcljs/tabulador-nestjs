import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Envio } from './entities/envio.entity';
import { TabuladorService } from './services/tabulador.service';
import { TabuladorController } from './controllers/tabulador.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Envio])],
  providers: [TabuladorService],
  controllers: [TabuladorController],
})
export class TabuladorModule {}
