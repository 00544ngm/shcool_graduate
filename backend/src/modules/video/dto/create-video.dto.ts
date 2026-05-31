import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateVideoDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;
}
