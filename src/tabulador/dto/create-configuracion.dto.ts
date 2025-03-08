import { IsEnum, IsNumber, IsOptional } from 'class-validator';

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

  // Nuevos campos
  @IsNumber()
  @IsOptional()
  costoHospedaje?: number;

  @IsEnum(['EXPRESS', 'TODOS'])
  @IsOptional()
  aplicableHospedaje?: string;

  // Consumo de combustible por vehículo
  @IsNumber()
  @IsOptional()
  consumoSusukiEECO?: number;

  @IsNumber()
  @IsOptional()
  consumoMitsubishiL300?: number;

  @IsNumber()
  @IsOptional()
  consumoNHR?: number;

  @IsNumber()
  @IsOptional()
  consumoCanterCavaCorta?: number;

  @IsNumber()
  @IsOptional()
  consumoCanterCavaLarga?: number;
}


export class UpdateConfiguracionDto extends CreateConfiguracionDto {}