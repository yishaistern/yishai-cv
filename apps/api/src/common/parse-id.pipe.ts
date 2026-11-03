import { BadRequestException, Injectable, type ArgumentMetadata, type PipeTransform } from '@nestjs/common';

/** Route params arrive as strings; accept only positive integers like "12". */
@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    if (!/^\d+$/.test(value) || Number(value) < 1) {
      throw new BadRequestException(`Invalid ${metadata.data ?? 'id'}: ${value}`);
    }
    return Number(value);
  }
}
