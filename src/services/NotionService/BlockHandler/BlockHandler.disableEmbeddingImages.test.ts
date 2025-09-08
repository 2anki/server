import CardOption from '../../../lib/parser/Settings/CardOption';
import { ImageBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

// Mock the dependencies
jest.mock('axios');
jest.mock('../../../lib/misc/getUniqueFileName', () => jest.fn(() => 'unique-file-name'));
jest.mock('../../../lib/misc/file', () => ({
  SuffixFrom: jest.fn(() => '.jpg'),
  S3FileName: jest.fn((url: string) => url)
}));
jest.mock('../helpers/getImageUrl', () => ({
  getImageUrl: jest.fn((block: ImageBlockObjectResponse) => 'https://example.com/test-image.jpg')
}));
jest.mock('../helpers/isTesting', () => jest.fn(() => false));

import axios from 'axios';
import CustomExporter from '../../../lib/parser/exporters/CustomExporter';
import Workspace from '../../../lib/parser/WorkSpace';
import MockNotionAPI from '../_mock/MockNotionAPI';
import BlockHandler from './BlockHandler';
import { getImageUrl } from '../helpers/getImageUrl';

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGetImageUrl = getImageUrl as jest.MockedFunction<typeof getImageUrl>;

describe('BlockHandler - disable-embedding-images option', () => {
  let mockExporter: CustomExporter;
  let mockAPI: MockNotionAPI;
  let workspace: Workspace;
  
  beforeEach(() => {
    workspace = new Workspace(true, 'fs');
    mockExporter = new CustomExporter('test-deck', workspace.location);
    mockAPI = new MockNotionAPI('test-key', '3');
    
    // Reset mocks
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: Buffer.from('fake-image-data') });
    mockedGetImageUrl.mockReturnValue('https://example.com/test-image.jpg');
  });

  it('should embed images locally when disable-embedding-images is false (default behavior)', async () => {
    const settings = new CardOption({ 'disable-embedding-images': 'false' });
    const blockHandler = new BlockHandler(mockExporter, mockAPI, settings);
    
    const mockImageBlock = {
      type: 'image',
      id: 'test-id',
      image: {
        type: 'external',
        external: { url: 'https://example.com/test-image.jpg' }
      }
    } as ImageBlockObjectResponse;

    const result = await blockHandler.embedImage(mockImageBlock);

    expect(mockedAxios.get).toHaveBeenCalledWith('https://example.com/test-image.jpg', {
      responseType: 'arraybuffer'
    });
    expect(result).toBe('<img src="unique-file-name.jpg" />');
  });

  it('should use remote URLs when disable-embedding-images is true', async () => {
    const settings = new CardOption({ 'disable-embedding-images': 'true' });
    const blockHandler = new BlockHandler(mockExporter, mockAPI, settings);
    
    const mockImageBlock = {
      type: 'image',
      id: 'test-id',
      image: {
        type: 'external',
        external: { url: 'https://example.com/test-image.jpg' }
      }
    } as ImageBlockObjectResponse;

    const result = await blockHandler.embedImage(mockImageBlock);

    // Should not download the image
    expect(mockedAxios.get).not.toHaveBeenCalled();
    // Should return image tag with original URL
    expect(result).toBe('<img src="https://example.com/test-image.jpg" />');
  });

  it('should still return empty string when isTextOnlyBack is true regardless of disable-embedding-images setting', async () => {
    const settings = new CardOption({ 
      'disable-embedding-images': 'true',
      'paragraph': 'true' // This sets isTextOnlyBack to true
    });
    const blockHandler = new BlockHandler(mockExporter, mockAPI, settings);
    
    const mockImageBlock = {
      type: 'image',
      id: 'test-id',
      image: {
        type: 'external',
        external: { url: 'https://example.com/test-image.jpg' }
      }
    } as ImageBlockObjectResponse;

    const result = await blockHandler.embedImage(mockImageBlock);

    expect(result).toBe('');
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });
});