import {
  IsAlpha,
  IsEmail,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** DTO to validate users request */
export class UserLoginDTO {
  /** Their email */
  @ApiProperty({
    description: 'The email of the user',
    type: String,
  })
  @IsEmail()
  email: string;
  /** Their password */
  @ApiProperty({
    description: 'The password of the user',
    type: String,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/\d/, {
    message: 'password must contain number',
  })
  @Matches(/^(?!\s*$).+/, {
    message: 'password is required',
  })
  @Matches(/[A-Z]/, {
    message: 'password must contain capital letter',
  })
  @Matches(/[A-Z]/, {
    message: 'password must contain small letter',
  })
  password: string;
}

export class UserRegisterDTO extends UserLoginDTO {
  /** Name of user */
  @ApiProperty({
    description: 'The name of the user',
  })
  @IsString()
  @IsAlpha()
  @Length(3)
  name: string;
}
