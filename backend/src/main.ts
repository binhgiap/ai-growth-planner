import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CustomValidationPipe } from './common/pipes/custom-validation.pipe';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { runStartupChecks } from './config/startup';

async function bootstrap() {
  // Run startup validation checks
  try {
    await runStartupChecks();
  } catch (error) {
    console.error('Startup checks failed:', error);
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Apply global pipes
  app.useGlobalPipes(new CustomValidationPipe());

  // Apply global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Apply global interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Set API prefix
  app.setGlobalPrefix('api');

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('AI Growth Planner API')
    .setDescription(
      'REST API for AI Growth Planner - A platform that generates personalized 6-month development roadmaps for employees using multi-agent AI workflow',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(
    `📚 Swagger documentation available at http://localhost:${port}/api/docs`,
  );
}

void bootstrap();
