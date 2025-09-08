import CardOption from '../CardOption';

describe('CardOption - disable-embedding-images setting', () => {
  it('should default disable-embedding-images to false', () => {
    const settings = new CardOption({});
    expect(settings.disableEmbeddingImages).toBe(false);
  });

  it('should set disable-embedding-images to true when explicitly enabled', () => {
    const settings = new CardOption({ 'disable-embedding-images': 'true' });
    expect(settings.disableEmbeddingImages).toBe(true);
  });

  it('should set disable-embedding-images to false when explicitly disabled', () => {
    const settings = new CardOption({ 'disable-embedding-images': 'false' });
    expect(settings.disableEmbeddingImages).toBe(false);
  });

  it('should include disable-embedding-images in default options with false value', () => {
    const defaultOptions = CardOption.LoadDefaultOptions();
    expect(defaultOptions['disable-embedding-images']).toBe('false');
  });

  it('should work correctly with other settings', () => {
    const settings = new CardOption({
      'disable-embedding-images': 'true',
      'paragraph': 'false',
      'all': 'true'
    });
    
    expect(settings.disableEmbeddingImages).toBe(true);
    expect(settings.isTextOnlyBack).toBe(false);
    expect(settings.isAll).toBe(true);
  });
});