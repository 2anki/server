import supportedOptions from '../supportedOptions';

describe('supportedOptions - disable-embedding-images', () => {
  it('should include disable-embedding-images option', () => {
    const options = supportedOptions();
    const disableEmbeddingOption = options.find(opt => opt.key === 'disable-embedding-images');
    
    expect(disableEmbeddingOption).toBeDefined();
    expect(disableEmbeddingOption?.label).toBe('Disable Embedding Images');
    expect(disableEmbeddingOption?.value).toBe(false); // Default should be false
    expect(disableEmbeddingOption?.description).toContain('remote images will not be downloaded');
    expect(disableEmbeddingOption?.description).toContain('smaller Anki package sizes');
  });

  it('should maintain all existing options', () => {
    const options = supportedOptions();
    
    // Check that some key existing options are still present
    expect(options.find(opt => opt.key === 'paragraph')).toBeDefined();
    expect(options.find(opt => opt.key === 'all')).toBeDefined();
    expect(options.find(opt => opt.key === 'cloze')).toBeDefined();
    expect(options.find(opt => opt.key === 'image-quiz-html-to-anki')).toBeDefined();
  });
});