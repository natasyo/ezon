import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateCellDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  name!: string;
}
