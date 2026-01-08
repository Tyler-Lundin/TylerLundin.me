'use server';

import OpenAI from 'openai';
import { Advertisement } from '@/types/marketing';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAdContentAction(prompt: string): Promise<Partial<Advertisement>> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API Key is missing');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert marketing copywriter. Your goal is to generate high-converting advertisement content based on the user's request.
          
          You need to generate:
          - Title: Catchy, short (under 60 chars).
          - Description: Persuasive value prop (under 120 chars).
          - Placement: Recommend best placement (top_banner, sidebar, toast).
          - CTA Text: Action-oriented button text.
          - CTA Link: A sensible internal link path (e.g. /contact, /services).
          - Promo Code: A short, uppercase code if applicable (e.g. SUMMER25).
          - Styles: Recommend hex colors for background and text that fit the vibe.
          
          Return JSON only.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'ad_content',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              placement: { type: 'string', enum: ['top_banner', 'sidebar', 'toast'] },
              cta_text: { type: 'string' },
              cta_link: { type: 'string' },
              promo_code: { type: ['string', 'null'] },
              bg_color: { type: 'string', description: 'Hex color code' },
              text_color: { type: 'string', description: 'Hex color code' }
            },
            required: ['title', 'description', 'placement', 'cta_text', 'cta_link', 'promo_code', 'bg_color', 'text_color'],
            additionalProperties: false
          }
        }
      }
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error('No content generated');

    const result = JSON.parse(content);

    return {
      title: result.title,
      description: result.description,
      placement: result.placement,
      cta_text: result.cta_text,
      cta_link: result.cta_link,
      promo_code: result.promo_code || undefined,
      styles: {
        bg_color: result.bg_color,
        text_color: result.text_color
      }
    };

  } catch (error: any) {
    console.error('AI Generation Error:', error);
    throw new Error(error.message || 'Failed to generate ad content');
  }
}
