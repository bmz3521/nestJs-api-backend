import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AuthConfigService } from './auth/auth-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const authConfigService = app.get(AuthConfigService);

  await authConfigService.preload();

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Plan กิน Plan เที่ยว API')
    .setDescription('พยายามจะสร้าง api นัดเจอ สังสรรค์ วางแผนรวมตัวกับเพื่อนๆ')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
