import { IsEmail, IsString } from 'class-validator';
import { NotFoundException } from '@nestjs/common';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IUser, LiveServiceTypes } from '../';

/** The user DTO */
export class UserDTO {
  /** The display name of the user */
  @IsString()
  name: string;
  /** The unique email of the user */
  @IsEmail()
  email: string;
  /** Unique Uid of the user */
  uid?: string;
  socket?: SocketDTO;
}

class SocketDTO {
  @ApiProperty({
    enum: LiveServiceTypes,
  })
  type: LiveServiceTypes;
  data?: string;
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

/** Create DTO, but every key is optional */
export class UpdateUserDto extends PartialType(OmitType(UserDTO, ['uid'])) {}

export class DeleteUserDTO {
  _id: string;
}
