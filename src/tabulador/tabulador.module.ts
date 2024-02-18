import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvioEntity } from './entities/envio.entity';
import { TabuladorService } from './services/tabulador.service';
import { TabuladorController } from './controllers/tabulador.controller';
import { UsersModule } from 'src/users/users.module';
import { ConfiguracionModule } from './configuracion.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([EnvioEntity]),
    ConfiguracionModule,
  ],
  providers: [TabuladorService],
  controllers: [TabuladorController],
})
export class TabuladorModule {}
