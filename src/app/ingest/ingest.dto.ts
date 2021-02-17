import { Type } from 'class-transformer';
import { IsEnum, IsObject, IsString, ValidateNested } from 'class-validator';
import { AuthProviders } from 'src/models';

export class IngestAuthDTO {
  @IsEnum(AuthProviders)
  provider: AuthProviders;
  @IsString()
  id: string;
}
