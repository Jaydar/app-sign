import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ApplicationModule } from './Web/app.module';
import cookieParser from 'cookie-parser'


// import * as xmlparser from 'express-xml-bodyparser';
async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(ApplicationModule);
    app.enableCors();
    app.setViewEngine('hbs');
    app.useStaticAssets(join(__dirname, '../', 'Public'));
    app.setBaseViewsDir(join(__dirname, './', 'View'));
    app.use(cookieParser());
    await app.listen(3000);
}
bootstrap();
