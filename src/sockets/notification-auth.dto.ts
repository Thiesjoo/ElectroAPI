import { IsEnum, IsString } from 'class-validator';
import { AuthProviders } from 'src/models';


/** DTO for authenticating with the notification gateway */
export class NotificationAuthDTO {
  /** Provider to authenticate with */
  @IsEnum(AuthProviders)
  provider: AuthProviders;
  /** Uid of user */
  @IsString()
  id: string;
}
