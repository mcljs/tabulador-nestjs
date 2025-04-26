import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class CreateConfiguracionDto {
  @IsNumber()
  @IsOptional()
  costoPorKm?: number;

  @IsNumber()
  @IsOptional()
  costoGasolina?: number;

  @IsNumber()
  @IsOptional()
  @Min(0.1)
  @Max(100)
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

  // Costos de peaje por tipo de vehículo
  @IsNumber()
  @IsOptional()
  costoPeajeSusuki?: number;
  
  @IsNumber()
  @IsOptional()
  costoPeajeL300?: number;
  
  @IsNumber()
  @IsOptional()
  costoPeajeNHR?: number;
  
  @IsNumber()
  @IsOptional()
  costoPeajeCanterCorta?: number;
  
  @IsNumber()
  @IsOptional()
  costoPeajeCanterLarga?: number;
  
  @IsNumber()
  @IsOptional()
  costoPeajePlatforma?: number;
  
  @IsNumber()
  @IsOptional()
  costoPeajePitman?: number;
  
  @IsNumber()
  @IsOptional()
  costoPeajeChuto?: number;

  // Constantes para cálculos
  @IsNumber()
  @IsOptional()
  constP2Hasta100Km?: number;

  @IsNumber()
  @IsOptional()
  constP1Hasta100Km?: number;

  @IsNumber()
  @IsOptional()
  constP2Hasta250Km?: number;

  @IsNumber()
  @IsOptional()
  constP1Hasta250Km?: number;

  @IsNumber()
  @IsOptional()
  constP2Hasta600Km?: number;

  @IsNumber()
  @IsOptional()
  constP1Hasta600Km?: number;

  @IsNumber()
  @IsOptional()
  constP2Desde600Km?: number;

  @IsNumber()
  @IsOptional()
  constP1Desde600Km?: number;
}

export class UpdateConfiguracionDto extends CreateConfiguracionDto {}