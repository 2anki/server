import Anthropic from '@anthropic-ai/sdk';

interface GenerateTemplateRequest {
  prompt: string;
  stylePreset?: string;
}

interface GeneratedTemplate {
  name: string;
  description: string;
  baseType: string;
  fields: { name: string }[];
  cards: { name: string; qfmt: string; afmt: string }[];
  css: string;
  previewData: Record<string, string>;
}

const STYLE_HINTS: Record<string, string> = {
  minimal:
    'Clean, minimal design. Lots of whitespace, thin borders, muted colors. Think Apple design.',
  modern:
    'Modern with subtle gradients, rounded corners, soft shadows. Think Stripe/Linear.',
  medical:
    'Professional medical/scientific look. Clear hierarchy, color-coded sections for terms and definitions.',
  code: 'Developer-friendly. Dark background option, monospace fonts for code, syntax-highlighting-inspired colors.',
  vocabulary:
    'Language learning focused. Large primary word, phonetic guides, example sentences styled differently.',
  elegant:
    'Sophisticated with serif fonts, subtle textures, classic card feel. Think premium stationery.',
};

const SYSTEM_PROMPT = `You are an expert Anki flashcard template designer. You create beautiful, functional flashcard templates using HTML and CSS.

Anki template conventions:
- Use Anki's mustache syntax for fields: {{FieldName}}
- Back templates MUST start with {{FrontSide}} followed by <hr id=answer> then the answer content
- For cloze types, use {{cloze:Text}} in both front and back templates
- Use {{#FieldName}}...{{/FieldName}} to conditionally show content when a field is non-empty
- Use {{^FieldName}}...{{/FieldName}} to show content when a field IS empty
- Use {{hint:FieldName}} for fields that should be hidden until the user clicks to reveal
- CSS MUST style the .card class as the root selector (Anki wraps cards in <div class="card card1">)
- Include .nightMode .card styles for dark mode compatibility

Design requirements:
- Create visually stunning CSS that makes studying a pleasure
- Use modern CSS: flexbox, gradients, custom properties, smooth transitions
- Include responsive design that works on desktop and mobile Anki
- Use web-safe fonts or common system font stacks
- Use conditional fields for optional content (e.g. {{#Mnemonic}}<div class="mnemonic">{{Mnemonic}}</div>{{/Mnemonic}})
- CRITICAL: In Anki, the body element IS the .card element (body has class="card card1"). So gradients MUST go on .card with background-size: cover, background-repeat: no-repeat, min-height: 100vh, margin: 0, box-sizing: border-box. Do NOT use html/body rules. Do NOT use max-width or margin on .card — use .card > * or a nested wrapper for max-width instead.

Respond with ONLY valid JSON matching this schema:
{
  "name": "string - descriptive template name",
  "description": "string - one sentence description",
  "baseType": "basic | cloze",
  "fields": [{"name": "string"}],
  "cards": [{"name": "Card 1", "qfmt": "front HTML", "afmt": "back HTML"}],
  "css": "full CSS string",
  "previewData": {"FieldName": "example content for preview"}
}`;

export class AITemplateService {
  private client: Anthropic | null = null;

  private getClient(): Anthropic {
    if (!this.client) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY environment variable is not set');
      }
      this.client = new Anthropic({ apiKey });
    }
    return this.client;
  }

  async generateTemplate(
    request: GenerateTemplateRequest
  ): Promise<GeneratedTemplate> {
    const { prompt, stylePreset } = request;

    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt is required');
    }

    if (prompt.length > 1000) {
      throw new Error('Prompt must be under 1000 characters');
    }

    const styleHint =
      stylePreset && STYLE_HINTS[stylePreset]
        ? `\n\nStyle direction: ${STYLE_HINTS[stylePreset]}`
        : '';

    const userMessage = `Create an Anki flashcard template for: ${prompt.trim()}${styleHint}`;

    const client = this.getClient();
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from AI');
    }

    const rawText = textBlock.text.trim();
    const jsonText = rawText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(jsonText) as GeneratedTemplate;

    if (!parsed.name || !parsed.css || !parsed.cards || !parsed.fields) {
      throw new Error('Invalid template structure from AI');
    }

    return parsed;
  }
}
