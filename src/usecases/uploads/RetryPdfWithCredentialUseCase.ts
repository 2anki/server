import { PrepareDeck } from '../../infrastracture/adapters/fileConversion/PrepareDeck';
import Workspace from '../../lib/parser/WorkSpace';
import CardOption from '../../lib/parser/Settings';

export interface RetryPdfResult {
  apkg: Buffer;
  cardCount: number;
  name: string;
}

export interface RetryPdfNeedsCredential {
  needsCredential: true;
  reason: 'wrong_password';
}

export type RetryPdfOutcome = RetryPdfResult | RetryPdfNeedsCredential;

export class RetryPdfWithCredentialUseCase {
  async execute(
    fileBuffer: Buffer,
    filename: string,
    credential: string,
    paying: boolean,
    settings: CardOption,
    workspace: Workspace
  ): Promise<RetryPdfOutcome> {
    try {
      const result = await PrepareDeck({
        name: filename,
        files: [{ name: filename, contents: fileBuffer }],
        settings,
        noLimits: paying,
        workspace,
        pdfCredential: credential,
      });

      return {
        apkg: result.apkg,
        cardCount: result.cardCount,
        name: result.name,
      };
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('PDF_NEEDS_PASSWORD:')) {
        return { needsCredential: true, reason: 'wrong_password' };
      }
      throw error;
    }
  }
}
