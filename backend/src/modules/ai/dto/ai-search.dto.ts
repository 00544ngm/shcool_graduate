import { IsString } from 'class-validator';

export class AiSearchDto {
  @IsString()
  query!: string;
}
