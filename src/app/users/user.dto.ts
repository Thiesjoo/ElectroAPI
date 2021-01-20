import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IUser } from 'src/models';
import { IsEmail, IsString } from 'class-validator';

export class UserDTO {
  @IsString()
  @ApiProperty({
    description: 'The display name of the user',
    type: String,
  })
  name: string;
  @ApiProperty({
    description: 'The unique Id of the User',
    type: String,
  })
  uid: string;
  @IsEmail()
  @ApiProperty({
    description: 'The unique Email of the User',
    type: String,
  })
  email: string;
}

export function userMapper(user: IUser): UserDTO {
  return {
    uid: user?.id || user?._id,
    name: user?.name,
    email: user?.email,
  };
}

export class UpdateUserDto extends PartialType(UserDTO) {}
