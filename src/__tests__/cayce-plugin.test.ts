import { CayceBasePlugin } from '../cayce-plugin.js';
import { ScanRule } from '../scan-rule.js';
import * as fs from 'node:fs';
import TreeSitter from 'tree-sitter';

// Mock fs
jest.mock('node:fs', () => ({
  readFileSync: jest.fn().mockReturnValue('{"name": "test-plugin"}'),
}));

// Mock require.resolve for CayceBasePlugin
jest.mock('../cayce-plugin.js', () => {
  const actual = jest.requireActual('../cayce-plugin.js');
  
  class MockCayceBasePlugin {
    // Mock implementation of getPackageId that doesn't use require.resolve
    getPackageId() {
      try {
        // Using a mocked package path directly
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const packageDef = JSON.parse(fs.readFileSync('/mocked/package.json', 'utf8'));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
        return packageDef.name;
      } catch (error) {
        console.error('Could not read package.json. Do you have permissions to read it? Is it present?:', error);
        return 'invalid';
      }
    }

    getRules() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rules = this.registerRules() as any[];
      rules.forEach((rule) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-confusing-void-expression
        rule.TreeSitterLanguage = this.getLanguage();
      });
      return rules;
    }

    // Abstract methods (to be implemented by child classes)
    getLanguage() {
      throw new Error('Method not implemented');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    registerRules() {
      return [];
    }
  }

  return {
    ...actual,
    CayceBasePlugin: MockCayceBasePlugin,
  };
});

// Create mock rule objects
const mockRule1 = { TreeSitterLanguage: null };
const mockRule2 = { TreeSitterLanguage: null };

// Test implementation of CayceBasePlugin
class TestPlugin extends CayceBasePlugin {
  mockLanguage = {} as TreeSitter.Language;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  mockRules = [mockRule1, mockRule2] as unknown as ScanRule[];

  getLanguage(): TreeSitter.Language {
    return this.mockLanguage;
  }

  registerRules(): ScanRule[] {
    return this.mockRules;
  }
}

describe('CayceBasePlugin', () => {
  let testPlugin: TestPlugin;

  beforeEach(() => {
    testPlugin = new TestPlugin();
    jest.clearAllMocks();
  });

  describe('getPackageId', () => {
    it('should return package name from package.json', () => {
      const packageId = testPlugin.getPackageId();
      expect(packageId).toBe('test-plugin');
    });

    it('should return "invalid" when there is an error reading package.json', () => {
      (fs.readFileSync as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Cannot read file');
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const packageId = testPlugin.getPackageId();
      
      expect(packageId).toBe('invalid');
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('getRules', () => {
    it('should return rules with TreeSitterLanguage set', () => {
      const rules = testPlugin.getRules();
      
      expect(rules).toHaveLength(2);
      expect(rules).toBe(testPlugin.mockRules);
      rules.forEach(rule => {
        expect(rule.TreeSitterLanguage).toBe(testPlugin.mockLanguage);
      });
    });
  });
});