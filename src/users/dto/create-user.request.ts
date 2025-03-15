import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserRequest {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
