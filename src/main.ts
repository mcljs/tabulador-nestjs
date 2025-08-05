import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import * as morgan from 'morgan';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

import { AppModule } from './app.module';
import { CORS } from './config';

async function bootstrap() {
  // Cambiar a NestExpressApplication para poder servir archivos estáticos
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(morgan('dev'));

  // AÑADIR: Aumentar límites para imágenes base64
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // CORREGIR: Usar ruta absoluta para uploads
  const uploadsPath = '/root/tabulador-nestjs/uploads';
  console.log(`🔍 Intentando servir archivos desde: ${uploadsPath}`);

  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  // Verificar que el directorio existe
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fs = require('fs');
  if (fs.existsSync(uploadsPath)) {
    console.log(`✅ Directorio de uploads encontrado: ${uploadsPath}`);
  } else {
    console.error(`❌ Directorio de uploads NO encontrado: ${uploadsPath}`);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const reflector = app.get(Reflector);

  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  const configService = app.get(ConfigService);

  app.enableCors(CORS);

  app.setGlobalPrefix('api/v1');

  const options = new DocumentBuilder()
    .setTitle('AgileFlow API')
    .setDescription('The API Manage Projects: Flowing Agilely Through Tasks.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('AgileFlow/docs', app, document);

  await app.listen(configService.get('PORT'));
  console.log(`Server Application Up: ${await app.getUrl()}`);
  console.log(
    `📁 Archivos estáticos servidos desde: ${await app.getUrl()}/uploads/`,
  );

  // Test de archivo específico
  const testFile = join(
    uploadsPath,
    'comprobantes',
    'comprobante-1754425679739-uqub9gd0f.jpeg',
  );
  if (fs.existsSync(testFile)) {
    console.log(`✅ Archivo de prueba encontrado: ${testFile}`);
  } else {
    console.error(`❌ Archivo de prueba NO encontrado: ${testFile}`);
  }
}
bootstrap();
