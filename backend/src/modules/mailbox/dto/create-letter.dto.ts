import { IsString, MinLength, IsIn } from 'class-validator';

export class CreateLetterDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  content!: string;

  @IsIn(['1y', '3y', '5y', 'custom'])
  unlockType!: string;

  unlockDate?: string;
}
