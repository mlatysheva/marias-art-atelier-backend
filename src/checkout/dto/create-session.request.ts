import { IsString } from 'class-validator';

export class CreateSessionRequest {
  @IsString()
  paintingId: string;
}
