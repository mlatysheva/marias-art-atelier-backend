import { Module } from '@nestjs/common';
import { DescriptionAiService } from './descriptionAi.service';
import { DescriptionAiController } from './descriptionAi.controller';
@Module({
  providers: [DescriptionAiService],
  controllers: [DescriptionAiController],
  exports: [DescriptionAiService],
})
export class DescriptionAiModule {}
