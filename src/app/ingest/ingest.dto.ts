import { IsEnum, IsString } from 'class-validator';
import { AuthProviders } from 'src/models';

/** DTO for authenticating with the ingest gateway */
export class IngestAuthDTO {
  /** Provider to authenticate with */
  @IsEnum(AuthProviders)
  provider: AuthProviders;
  /** Uid of user */
  @IsString()
  id: string;
}
