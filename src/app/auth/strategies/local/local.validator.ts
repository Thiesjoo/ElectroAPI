import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class ValidationDTO {
  @IsEmail()
  @ApiProperty({
    description: 'The email of the user',
    type: String,
  })
  email: string;
  @IsString()
  @ApiProperty({
    description: 'The password of the user',
    type: String,
  })
  password: string;
}
