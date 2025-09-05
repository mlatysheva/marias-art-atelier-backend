import OpenAI from "openai";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DescriptionAiService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateDescriptionFromTags(tags: string[]): Promise<string> {
    const prompt = `You are an art expert. Generate a compelling, detailed description for a painting using the following tags: ${tags.join(", ")}. The description should help selling the painting on websites like Etsy or eBay. Keep it under 200 words. Do not add a heading.`;

    const response = await this.client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    return response.choices[0].message?.content ?? "";
  }
}
