import { IsNumber, IsOptional } from 'class-validator';

export class CreateConfiguracionDto {
  @IsNumber()
  @IsOptional()
  costoPorKm?: number;

  @IsNumber()
  @IsOptional()
  costoGasolina?: number;

  @IsNumber()
  @IsOptional()
  porcentajeProteccion?: number;

  @IsNumber()
  @IsOptional()
  proteccionMinima?: number;

  @IsNumber()
  @IsOptional()
  franqueoPostal?: number;
}
