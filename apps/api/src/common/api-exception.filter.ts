import { Catch, HttpException, Logger, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';

/**
 * Turns every error into the `{ error: string }` JSON the web app expects
 * (Nest's default is `{ statusCode, message, error }`).
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ApiExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      let message: unknown =
        typeof body === 'string' ? body : ((body as { message?: unknown }).message ?? exception.message);
      // ValidationPipe reports one message per failed constraint.
      if (Array.isArray(message)) message = message.join('; ');
      res.status(exception.getStatus()).json({ error: String(message) });
      return;
    }

    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    res.status(500).json({ error: 'Internal server error' });
  }
}
