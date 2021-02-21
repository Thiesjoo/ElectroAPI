import { IsEmail, IsString } from 'class-validator';
import { NotFoundException } from '@nestjs/common';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IUser } from '../';

/** The user DTO */
export class UserDTO {
  /** The display name of the user */
  @IsString()
  @ApiProperty({
    description: 'The display name of the user',
    type: String,
  })
  name: string;
  /** The unique email of the user */
  @IsEmail()
  @ApiProperty({
    description: 'The unique email of the user',
    type: String,
  })
  email: string;
  /** Unique Uid of the user */
  @ApiProperty({
    description: 'The unique Uid of the user',
    type: String,
  })
  uid?: string;
}

/** Map the user to the DTO user */
export function userMapper(user: IUser): UserDTO {
  if (!user) {
    throw new NotFoundException();
  }
  return {
    uid: user?.id || user?._id,
    name: user?.name,
    email: user?.email,
  };
}

/** Update DTO is a partial of the DTO */
export class UpdateUserDto extends PartialType(UserDTO) {}
