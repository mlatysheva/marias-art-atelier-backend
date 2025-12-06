import { Controller, Post, Body } from '@nestjs/common';
import { DescriptionAiService } from './descriptionAi.service';

@Controller('ai')
export class DescriptionAiController {
  constructor(private readonly descriptionAiService: DescriptionAiService) {}

  @Post('generate-description')
  async generateDescription(@Body('tags') tags: string[]) {
    if (!tags || tags.length === 0) {
      return { description: '' };
    }

    const description =
      await this.descriptionAiService.generateDescriptionFromTags(tags);
    return { description };
  }
}
