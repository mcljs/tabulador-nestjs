import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateEnvioDto {
  @IsNumber()
  @Min(0)
  distancia: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  peso?: number;

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

  @IsOptional()
  @IsNumber()
  @Min(0)
  costoTotal: number;
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
}

export class UpdateEnvioDto {
  status: string;
}
