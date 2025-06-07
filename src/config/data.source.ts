import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Determina el ambiente y carga el archivo .env correspondiente
const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${nodeEnv}` });

// También intenta cargar un .env genérico como respaldo
dotenv.config();

// Depuración para verificar la carga de variables
console.log('Environment:', nodeEnv);
console.log('Database config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  passwordExists: !!process.env.DB_PASSWORD,
});

export const DataSourceConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  // Forzar a string para evitar el error de SASL
  password: String(process.env.DB_PASSWORD || ''),
  database: process.env.DB_DATABASE,
  entities: [join(__dirname, '../**/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
  synchronize: false,
  migrationsRun: false,
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
};

export const DataSourceApp = new DataSource(DataSourceConfig);
