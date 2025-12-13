import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
export class UpdatePaintingRequest {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  artist: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  tags: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  year: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  price: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  width: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  height: number;

  @IsString()
  @IsOptional()
  medium: string;

  @IsString()
  @IsOptional()
  base: string;

  @IsBoolean()
  @IsOptional()
  sold: boolean;

  @IsOptional()
  imagesToKeep?: string[];
}
