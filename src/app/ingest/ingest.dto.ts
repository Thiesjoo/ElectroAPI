import { Type } from 'class-transformer';
import { IsEnum, IsObject, IsString, ValidateNested } from 'class-validator';
import { AuthProviders } from 'src/models';

export class IngestAuthDTO {
  @IsEnum(AuthProviders)
  provider: AuthProviders;
  @IsString()
  id: string;
}

export class DataAuthor {
  @IsString()
  name: string;
  @IsString()
  image: string;
}

export class DataPacket {
  @IsString()
  image: string;
  @IsString()
  title: string;
  @IsString()
  message: string;
  @IsString()
  time: string;
  @IsObject()
  @ValidateNested()
  @Type(() => DataAuthor)
  author: DataAuthor;
  @IsObject()
  extra: {};
}
