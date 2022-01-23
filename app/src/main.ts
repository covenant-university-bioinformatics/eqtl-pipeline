import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import * as compression from 'compression';
import connectDB from './mongoose';
import * as helmet from 'helmet';
import * as mongoSanitize from 'express-mongo-sanitize';
import * as xss from 'xss-clean';
import * as rateLimit from 'express-rate-limit';
import * as hpp from 'hpp';
import appConfig from './config/app.config';

async function bootstrap() {
  // await connectDB();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  // app.use(express.limit('4M'));
  // app.use(express.limit('300M'));
  app.use(cookieParser());
  app.use(mongoSanitize());
  app.use(xss());

  const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10 mins
    max: 100,
  });
  app.use(limiter);

  app.use(hpp());
  app.use(helmet());
  app.use(compression());
  app.use(
    `/api/${appConfig.appName}/pv/analysis`,
    express.static('/pv/analysis'),
  );
  app.use(
    `/api/${appConfig.appNamePlot}/pv/analysis`,
    express.static('/pv/analysis'),
  );

  await app.listen(3000);
}

connectDB().then(() => {
  bootstrap();
});
