// Import the main index file to ensure it exports correctly
import * as Index from '../index.js';

describe('Index exports', () => {
    it('should export all required types and formatters', () => {
        // Verify exports exist
        expect(Index.OutputFormat).toBeDefined();
        expect(typeof Index.OutputFormat).toBe('object');
    });
});
