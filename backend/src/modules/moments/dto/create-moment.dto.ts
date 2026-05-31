import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateMomentDto {
  @IsString()
  content!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
