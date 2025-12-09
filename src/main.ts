import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

declare const module: any;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   app.useGlobalPipes(new ValidationPipe());
   app.enableCors({
     origin: '*',
     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
     preflightContinue: false,
   });
   app.setGlobalPrefix('api');
   const config = new DocumentBuilder()
    .setTitle('API quản lý chi tiêu cho Nhóm và Gia đình')
    .setDescription('Đây là api cho hệ thống quản lý các chi tiêu cho nhóm và gia đình')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
       bearerFormat: 'JWT',
       name: 'Authorization',
        in: 'header',
    }, 'access-token')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  if(module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
