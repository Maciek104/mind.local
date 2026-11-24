import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class InitializeSetupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, {
    message: 'Hasło musi mieć co najmniej 8 znaków',
  })
  @MaxLength(128)
  password: string;

  @IsString()
  confirmPassword: string;
}
