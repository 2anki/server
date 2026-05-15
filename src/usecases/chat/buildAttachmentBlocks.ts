import type Anthropic from '@anthropic-ai/sdk';

export interface ChatAttachment {
  mimeType: string;
  data: Buffer;
}

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

const IMAGE_MIMES = new Set<string>(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);

function isImageMime(mime: string): mime is ImageMediaType {
  return IMAGE_MIMES.has(mime);
}

export function buildAttachmentBlocks(
  attachments: ChatAttachment[]
): Anthropic.ContentBlockParam[] {
  return attachments.map((attachment): Anthropic.ContentBlockParam => {
    const data = attachment.data.toString('base64');

    if (isImageMime(attachment.mimeType)) {
      const block: Anthropic.ImageBlockParam = {
        type: 'image',
        source: {
          type: 'base64',
          media_type: attachment.mimeType,
          data,
        },
      };
      return block;
    }

    const block: Anthropic.DocumentBlockParam = {
      type: 'document',
      source: {
        type: 'base64',
        media_type: 'application/pdf',
        data,
      },
    };
    return block;
  });
}
