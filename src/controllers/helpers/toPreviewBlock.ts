import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import {
  isExpandable,
  renderBlockPreview,
  renderBlockSummary,
} from '../../services/NotionService/helpers/renderBlockPreview';

export interface PreviewBlockPayload {
  id: string;
  type: string;
  hasChildren: boolean;
  canExpand: boolean;
  html: string;
  summaryHtml?: string;
}

export function toPreviewBlock(block: BlockObjectResponse): PreviewBlockPayload {
  const canExpand = isExpandable(block);
  return {
    id: block.id,
    type: block.type,
    hasChildren: block.has_children === true,
    canExpand,
    html: canExpand ? '' : renderBlockPreview(block),
    summaryHtml: canExpand ? renderBlockSummary(block) : undefined,
  };
}
