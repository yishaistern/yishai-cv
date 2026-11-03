// Request bodies, validated by the global ValidationPipe (see main.ts).
// They implement the shared contract types so the API and the web app can't drift apart.
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Validate,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';
import type { CreateVersionBody, CvData, UpdateVersionBody } from '@yishai-cv/shared';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * A shallow sanity check of CvData: right top-level keys with the right types.
 * Not a full schema validation, just enough to reject obviously broken payloads.
 */
@ValidatorConstraint({ name: 'isCvData' })
class IsCvData implements ValidatorConstraintInterface {
  validate(v: unknown): boolean {
    return (
      isObject(v) &&
      isObject(v.header) &&
      isObject(v.contact) &&
      typeof v.summary === 'string' &&
      Array.isArray(v.skills) &&
      isObject(v.education) &&
      Array.isArray(v.languages) &&
      isObject(v.military) &&
      Array.isArray(v.jobs) &&
      Array.isArray(v.strengths)
    );
  }

  defaultMessage(): string {
    return '"data" is not a valid CvData object';
  }
}

export class CreateVersionDto implements CreateVersionBody {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: '"name" is required' })
  name!: string;

  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() targetCompany?: string;
  @IsOptional() @IsString() targetRole?: string;

  /** Duplicate this version's data; otherwise start from the base CV. */
  @IsOptional()
  @IsInt({ message: '"fromVersionId" must be a positive integer' })
  @Min(1, { message: '"fromVersionId" must be a positive integer' })
  fromVersionId?: number;
}

export class UpdateVersionDto implements UpdateVersionBody {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: '"name" cannot be empty' })
  name?: string;

  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() targetCompany?: string;
  @IsOptional() @IsString() targetRole?: string;
  @IsOptional() @IsString() note?: string;

  /** When present, the new CV content; saving it records a revision. */
  @IsOptional()
  @Validate(IsCvData)
  data?: CvData;
}
