import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvioEntity } from './entities/envio.entity';
import { TabuladorService } from './services/tabulador.service';
import { TabuladorController } from './controllers/tabulador.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([EnvioEntity])],
  providers: [TabuladorService],
  controllers: [TabuladorController],
})
export class TabuladorModule {}
