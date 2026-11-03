import { Injectable, ValidationPipe, type ArgumentMetadata } from '@nestjs/common';

/**
 * ValidationPipe for request bodies only (DTO classes with class-validator decorators).
 * The stock pipe with `transform: true` also converts route params to their declared
 * type, so "abc" would reach ParseIdPipe as NaN; params are left to their own pipes.
 */
@Injectable()
export class BodyValidationPipe extends ValidationPipe {
  constructor() {
    super({ transform: true, whitelist: true });
  }

  override transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown> {
    return metadata.type === 'body' ? super.transform(value, metadata) : Promise.resolve(value);
  }
}
