import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
export class CreatePaintingRequest {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  artist: string;

  @IsString()
  description: string;

  @IsString()
  tags: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  year: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  price: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  width: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  height: number;

  @IsString()
  medium: string;

  @IsString()
  base: string;
}
