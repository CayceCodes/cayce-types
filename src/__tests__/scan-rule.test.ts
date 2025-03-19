import { id, message, name, category, treeQuery, suggestion, context, ruleSeverity, ScanRule } from '../scan-rule.js';
import { RuleSeverity } from '../rule-severity.js';
import Parser, { Language } from 'tree-sitter';

// Mock tree-sitter modules
jest.mock('tree-sitter', () => {
  const mockNode = {
    startPosition: { row: 1, column: 5 },
    endPosition: { row: 1, column: 15 },
    startIndex: 5,
    endIndex: 15,
    text: 'mock code text',
  };

  const mockCaptures = [
    { name: 'target.function', node: mockNode },
    { name: 'other', node: { ...mockNode, text: 'other node' } }
  ];

  const mockQuery = {
    captures: jest.fn().mockReturnValue(mockCaptures)
  };

  const MockQuery = jest.fn().mockImplementation(() => mockQuery);
  
  const mockRootNode = { type: 'program' };
  const mockTree = { rootNode: mockRootNode };
  
  const mockParser = {
    setLanguage: jest.fn(),
    parse: jest.fn().mockReturnValue(mockTree)
  };
  
  const MockParser = jest.fn().mockImplementation(() => mockParser);
  
  return {
    __esModule: true,
    default: MockParser,
    Query: MockQuery,
    Language: jest.fn(),
  };
});

// Create a test language
const mockLanguage = {} as Language;

// Test implementation of ScanRule
@id('TEST-001')
@message('Test message')
@name('Test Rule')
@category('Test Category')
@treeQuery('(function_declaration) @target.function')
@suggestion('Test suggestion')
@context('Test context')
@ruleSeverity(RuleSeverity.WARNING)
class TestScanRule extends ScanRule {
  constructor() {
    super();
    this.TreeSitterLanguage = mockLanguage;
    this.Priority = 5;
  }
}

describe('ScanRule', () => {
  let testRule: TestScanRule;

  beforeEach(() => {
    testRule = new TestScanRule();
  });

  describe('Decorators', () => {
    it('should apply id decorator correctly', () => {
      expect(testRule.Id).toBe('TEST-001');
    });

    it('should apply message decorator correctly', () => {
      expect(testRule.Message).toBe('Test message');
    });

    it('should apply name decorator correctly', () => {
      expect(testRule.Name).toBe('Test Rule');
    });

    it('should apply category decorator correctly', () => {
      expect(testRule.Category).toBe('Test Category');
    });

    it('should apply treeQuery decorator correctly', () => {
      expect(testRule.TreeQuery).toBe('(function_declaration) @target.function');
    });

    it('should apply suggestion decorator correctly', () => {
      expect(testRule.Suggestion).toBe('Test suggestion');
    });

    it('should apply context decorator correctly', () => {
      expect(testRule.Context).toBe('Test context');
    });

    it('should apply ruleSeverity decorator correctly', () => {
      expect(testRule.RuleSeverity).toBe(RuleSeverity.WARNING);
    });
  });

  describe('validate method', () => {
    it('should parse source and query tree-sitter nodes', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _results = testRule.validate('function test() { return true; }');
      
      const parser = new Parser();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(parser.setLanguage).toHaveBeenCalledWith(mockLanguage);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(parser.parse).toHaveBeenCalledWith('function test() { return true; }');
    });

    it('should return scan result digests for target captures', () => {
      const results = testRule.validate('function test() { return true; }');
      
      expect(results).toHaveLength(1);
      expect(results[0].RuleId).toBe('TEST-001');
      expect(results[0].Message).toBe('Test message');
      expect(results[0].Start.Row).toBe(1);
      expect(results[0].Start.Column).toBe(5);
      expect(results[0].End.Row).toBe(1);
      expect(results[0].End.Column).toBe(15);
      expect(results[0].NodeText).toBe('mock code text');
    });

    it('should only build scan results for captures starting with "target"', () => {
      const results = testRule.validate('function test() { return true; }');
      
      expect(results).toHaveLength(1);
      // The mock returns two captures but only one starts with 'target'
    });
  });

  describe('buildScanResult method', () => {
    it('should create a proper ScanResultDigest from a syntax node', () => {
      const mockNode = {
        startPosition: { row: 2, column: 10 },
        endPosition: { row: 3, column: 20 },
        startIndex: 100,
        endIndex: 200,
        text: 'sample node text',
      };
      
      // Access the protected method using type assertion
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = (testRule as any).buildScanResult(mockNode);
      
      expect(result).toMatchObject({
        RuleId: 'TEST-001',
        Start: { Row: 2, Column: 10, Index: 100 },
        End: { Row: 3, Column: 20, Index: 200 },
        Message: 'Test message',
        Suggestion: 'Test suggestion',
        Category: 'Test Category',
        Severity: RuleSeverity.WARNING.valueOf(),
        Context: 'Test context',
        NodeText: 'sample node text',
      });
    });
  });

  describe('getSource method', () => {
    it('should return the raw source after validation', () => {
      const sourceCode = 'function test() { return true; }';
      testRule.validate(sourceCode);
      
      expect(testRule.getSource()).toBe(sourceCode);
    });
    
    it('should return undefined if validate has not been called', () => {
      expect(testRule.getSource()).toBeUndefined();
    });
  });
});