import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IUser } from 'src/models';
import * as Joiful from 'joiful';

export class UserDTO {
  @(Joiful.string().required())
  @ApiProperty({
    description: 'The display name of the user',
    type: String,
  })
  name: string;
  @Joiful.string()
  @ApiProperty({
    description: 'The unique Id of the User',
    type: String,
  })
  uid: string;
}

export function userMapper(user: IUser): UserDTO {
  return {
    uid: user?.id || user?._id,
    name: user?.name,
  };
}

export class UpdateUserDto extends PartialType(UserDTO) {}
