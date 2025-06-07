import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateEnvioDto {
  @IsNumber()
  @Min(0)
  distancia: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  peso?: number; // Este campo permite decimales

  @IsNumber()
  @Min(0)
  valorDeclarado: number;

  @IsNumber()
  @Min(0)
  flete: number;

  @IsNumber()
  @Min(0)
  proteccionEncomienda: number;

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @Min(0)
  iva: number;

  @IsNumber()
  @Min(0)
  franqueoPostal: number;

  @IsNumber()
  @Min(0)
  totalAPagar: number;

  @IsOptional()
  @IsString()
  trackingNumber: string;

  @IsOptional()
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  ruteInitial?: string;

  @IsOptional()
  @IsString()
  ruteFinish?: string;

  @IsString()
  tipoArticulo: string;

  // Nuevos campos
  @IsEnum(['NORMAL', 'EXPRESS'])
  tipoEnvio: string;

  @IsBoolean()
  esSobre: boolean;

  // Solo se requieren dimensiones si no es un sobre
  @ValidateIf(o => !o.esSobre)
  @IsNumber()
  @Min(0)
  ancho: number;

  @ValidateIf(o => !o.esSobre)
  @IsNumber()
  @Min(0)
  alto: number;

  @ValidateIf(o => !o.esSobre)
  @IsNumber()
  @Min(0)
  largo: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  volumen?: number;

  @IsOptional()
  @IsString()
  tipoVehiculo?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costoHospedaje?: number;

  @IsOptional()
  @IsNumber()
  cantidadPeajes?: number;

  @IsOptional()
  @IsNumber()
  costoPeaje?: number;

  @IsOptional()
  @IsNumber()
  totalPeaje?: number;
}

export class CalculaterDto {
  @IsNumber()
  @Min(0)
  distancia: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  peso?: number;

  @IsString()
  tipoArticulo: string;

  @IsNumber()
  @Min(0)
  valorDeclarado: number;

  // Nuevos campos
  @IsEnum(['NORMAL', 'EXPRESS'])
  tipoEnvio: string;

  @IsBoolean()
  esSobre: boolean;

  // Solo se requieren dimensiones si no es un sobre
  @ValidateIf(o => !o.esSobre)
  @IsNumber()
  @Min(0)
  ancho: number;

  @ValidateIf(o => !o.esSobre)
  @IsNumber()
  @Min(0)
  alto: number;

  @ValidateIf(o => !o.esSobre)
  @IsNumber()
  @Min(0)
  largo: number;
}

export class UpdateEnvioDto {
  @IsString()
  @IsNotEmpty()
  status: string;
}