// Import the main index file to ensure it exports correctly
import * as Index from '../index.js';
import { Language } from 'tree-sitter';

// Mock abstract classes to test the decorators
class MockScanRule extends Index.ScanRule {
    constructor() {
        super();
        this.TreeSitterLanguage = {} as Language;
        this.Priority = 1;
    }
}

class MockCaycePlugin extends Index.CayceBasePlugin {
    getLanguage(): Language {
        return {} as Language;
    }

    registerRules(): Index.ScanRule[] {
        return [];
    }
}

describe('Index exports', () => {
    it('should export all required types and formatters', () => {
        // Verify basic exports exist
        expect(Index.OutputFormat).toBeDefined();
        expect(typeof Index.OutputFormat).toBe('object');

        // Check each exported item
        expect(Index.ScanRule).toBeDefined();
        expect(Index.CayceBasePlugin).toBeDefined();
        expect(Index.RuleSeverity).toBeDefined();
        expect(Index.OutputFormat).toBeDefined();
        expect(Index.CsvFormatter).toBeDefined();
        expect(Index.JsonFormatter).toBeDefined();
        expect(Index.SarifFormatter).toBeDefined();
        expect(Index.XmlFormatter).toBeDefined();
    });

    it('should export all required decorators', () => {
        expect(typeof Index.id).toBe('function');
        expect(typeof Index.context).toBe('function');
        expect(typeof Index.message).toBe('function');
        expect(typeof Index.name).toBe('function');
        expect(typeof Index.suggestion).toBe('function');
        expect(typeof Index.category).toBe('function');
        expect(typeof Index.treeQuery).toBe('function');
        expect(typeof Index.ruleSeverity).toBe('function');
    });

    it('should export decorators that can be applied to classes', () => {
        // Test all decorators on a mock class
        @Index.id('TEST-ID')
        @Index.message('Test message')
        @Index.name('Test name')
        @Index.category('Test category')
        @Index.treeQuery('(test) @target')
        @Index.suggestion('Test suggestion')
        @Index.context('Test context')
        @Index.ruleSeverity(Index.RuleSeverity.WARNING)
        class TestRule extends MockScanRule {}

        const rule = new TestRule();

        // Verify decorator effects
        expect(rule.Id).toBe('TEST-ID');
        expect(rule.Message).toBe('Test message');
        expect(rule.Name).toBe('Test name');
        expect(rule.Category).toBe('Test category');
        expect(rule.TreeQuery).toBe('(test) @target');
        expect(rule.Suggestion).toBe('Test suggestion');
        expect(rule.Context).toBe('Test context');
        expect(rule.RuleSeverity).toBe(Index.RuleSeverity.WARNING);
    });

    it('should export formatters that can be instantiated', () => {
        const jsonFormatter = new Index.JsonFormatter();
        const csvFormatter = new Index.CsvFormatter();
        const sarifFormatter = new Index.SarifFormatter();
        const xmlFormatter = new Index.XmlFormatter();

        expect(jsonFormatter).toBeInstanceOf(Index.JsonFormatter);
        expect(csvFormatter).toBeInstanceOf(Index.CsvFormatter);
        expect(sarifFormatter).toBeInstanceOf(Index.SarifFormatter);
        expect(xmlFormatter).toBeInstanceOf(Index.XmlFormatter);

        // Verify they all implement Formatter interface (checking method existence)
        expect(typeof jsonFormatter.format).toBe('function');
        expect(typeof csvFormatter.format).toBe('function');
        expect(typeof sarifFormatter.format).toBe('function');
        expect(typeof xmlFormatter.format).toBe('function');
    });

    it('should export CayceBasePlugin that can be extended', () => {
        const plugin = new MockCaycePlugin();

        expect(plugin).toBeInstanceOf(Index.CayceBasePlugin);
        expect(typeof plugin.getPackageId).toBe('function');
        expect(typeof plugin.getRules).toBe('function');
    });
});
