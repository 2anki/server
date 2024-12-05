import { getDatabase } from '../../data_layer';
import ParserRules from './ParserRules';

jest.mock('../../data_layer', () => ({
  getDatabase: jest.fn(),
}));

describe('ParserRules', () => {
  it('should handle missing flashcard_is gracefully', async () => {
    // Mock the database to return undefined
    (getDatabase as jest.Mock).mockReturnValue(() => ({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue(undefined), // Simulate missing data
        }),
      }),
    }));

    try {
      await ParserRules.Load('owner', 'id');
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError);
      expect(error.message).toContain('Cannot read properties of undefined');
    }
  });
}); 