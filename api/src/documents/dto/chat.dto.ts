// api/src/documents/dto/chat.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class ChatDto {
  @IsString()
  @IsNotEmpty()
  question: string;
}