import { IsString, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  targetType!: string;

  @IsString()
  targetId!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}
