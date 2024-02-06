import { Test, TestingModule } from '@nestjs/testing';
import { TabuladorController } from './tabulador.controller';

describe('TabuladorController', () => {
  let controller: TabuladorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TabuladorController],
    }).compile();

    controller = module.get<TabuladorController>(TabuladorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
