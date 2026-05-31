import { IsString, IsEmail, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { message: '密码必须包含大小写字母和数字' })
  password!: string;

  @IsString()
  @MinLength(1)
  nickname!: string;
}
