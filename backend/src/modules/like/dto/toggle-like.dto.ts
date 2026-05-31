import { IsString, IsNotEmpty } from 'class-validator';

export class ToggleLikeDto {
  @IsString()
  @IsNotEmpty()
  targetType!: string;

  @IsString()
  @IsNotEmpty()
  targetId!: string;
}
