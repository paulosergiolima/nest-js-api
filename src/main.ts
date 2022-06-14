import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './data-source';

AppDataSource.initialize().then(async () => {
  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
    }))
    await app.listen(3333);
  }
  bootstrap();

}).catch(error => console.log(error))


