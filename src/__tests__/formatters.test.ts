import { JsonFormatter } from '../formatters/json-formatter.js';
import { SarifFormatter } from '../formatters/sarif-formatter.js';
import { XmlFormatter } from '../formatters/xml-formatter.js';
import { CsvFormatter } from '../formatters/csv-formatter.js';
import { OutputFormat } from '../formatter.js';
import ScanResultDigest from '../scan-result-digest.js';
import fs from 'fs';
import path from 'path';

// Mock fs and path modules
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
}));

// Sample scan result digest data for testing
const mockScanResultDigests: ScanResultDigest[] = [
  {
    RuleId: 'RULE-001',
    Start: { Row: 10, Column: 5, Index: 100 },
    End: { Row: 10, Column: 15, Index: 110 },
    Message: 'Test message 1',
    Suggestion: 'Suggested fix 1',
    Severity: 8,
    Category: 'Security',
    Context: 'src/test.js',
    NodeText: 'const test = "test";',
  },
  {
    RuleId: 'RULE-002',
    Start: { Row: 20, Column: 8, Index: 200 },
    End: { Row: 20, Column: 18, Index: 210 },
    Message: 'Test message 2',
    Severity: 4,
    Context: 'src/test2.js',
  },
];

describe('Formatter Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('JsonFormatter', () => {
    const jsonFormatter = new JsonFormatter();
    
    it('should format ScanResultDigest array to JSON string', () => {
      const result = jsonFormatter.format(mockScanResultDigests, OutputFormat.Json);
      const parsed = JSON.parse(result);
      
      expect(parsed).toHaveLength(2);
      expect(parsed[0].RuleId).toBe('RULE-001');
      expect(parsed[1].RuleId).toBe('RULE-002');
    });
    
    it('should write JSON to file when filename is provided', () => {
      jsonFormatter.format(mockScanResultDigests, OutputFormat.Json, 'output.json');
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'output.json',
        expect.any(String),
        'utf8'
      );
    });
    
    it('should append .json extension if not present in filename', () => {
      jsonFormatter.format(mockScanResultDigests, OutputFormat.Json, 'output');
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'output.json',
        expect.any(String),
        'utf8'
      );
    });
    
    it('should return correct supported output formats', () => {
      expect(jsonFormatter.getSupportedOutputFormats()).toEqual([OutputFormat.Json]);
      expect(jsonFormatter.supportsOutputFormat(OutputFormat.Json)).toBe(true);
      expect(jsonFormatter.supportsOutputFormat(OutputFormat.Xml)).toBe(false);
    });
    
    it('should return correct name and file extension', () => {
      expect(jsonFormatter.getName()).toBe('JSON');
      expect(jsonFormatter.getFileExtension()).toBe('json');
    });
  });
  
  describe('SarifFormatter', () => {
    const sarifFormatter = new SarifFormatter();
    
    it('should format ScanResultDigest array to SARIF string', () => {
      const result = sarifFormatter.format(mockScanResultDigests, OutputFormat.Sarif);
      const parsed = JSON.parse(result);
      
      expect(parsed.version).toBe('2.1.0');
      expect(parsed.runs[0].results).toHaveLength(2);
      expect(parsed.runs[0].results[0].ruleId).toBe('RULE-001');
      expect(parsed.runs[0].results[1].ruleId).toBe('RULE-002');
      expect(parsed.runs[0].results[0].level).toBe('error');
      expect(parsed.runs[0].results[1].level).toBe('warning');
    });
    
    it('should write SARIF to file when filename is provided', () => {
      sarifFormatter.format(mockScanResultDigests, OutputFormat.Sarif, 'output.sarif');
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'output.sarif',
        expect.any(String),
        'utf8'
      );
    });
    
    it('should append .sarif extension if not present in filename', () => {
      sarifFormatter.format(mockScanResultDigests, OutputFormat.Sarif, 'output');
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'output.sarif',
        expect.any(String),
        'utf8'
      );
    });
    
    it('should return correct supported output formats', () => {
      expect(sarifFormatter.getSupportedOutputFormats()).toEqual([OutputFormat.Sarif, OutputFormat.Sarifv2]);
      expect(sarifFormatter.supportsOutputFormat(OutputFormat.Sarif)).toBe(true);
      expect(sarifFormatter.supportsOutputFormat(OutputFormat.Sarifv2)).toBe(true);
      expect(sarifFormatter.supportsOutputFormat(OutputFormat.Json)).toBe(false);
    });
    
    it('should return correct name and file extension', () => {
      expect(sarifFormatter.getName()).toBe('SARIF');
      expect(sarifFormatter.getFileExtension()).toBe('sarif');
    });
  });
  
  describe('XmlFormatter', () => {
    const xmlFormatter = new XmlFormatter();
    
    it('should format ScanResultDigest array to XML string', () => {
      const result = xmlFormatter.format(mockScanResultDigests, OutputFormat.Xml);
      
      expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(result).toContain('<scanResults>');
      expect(result).toContain('<RuleId>RULE-001</RuleId>');
      expect(result).toContain('<RuleId>RULE-002</RuleId>');
    });
    
    it('should write XML to file when filename is provided', () => {
      xmlFormatter.format(mockScanResultDigests, OutputFormat.Xml, 'output.xml');
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'output.xml',
        expect.any(String),
        'utf8'
      );
    });
    
    it('should append .xml extension if not present in filename', () => {
      xmlFormatter.format(mockScanResultDigests, OutputFormat.Xml, 'output');
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'output.xml',
        expect.any(String),
        'utf8'
      );
    });
    
    it('should return correct supported output formats', () => {
      expect(xmlFormatter.getSupportedOutputFormats()).toEqual([OutputFormat.Xml]);
      expect(xmlFormatter.supportsOutputFormat(OutputFormat.Xml)).toBe(true);
      expect(xmlFormatter.supportsOutputFormat(OutputFormat.Json)).toBe(false);
    });
    
    it('should return correct name and file extension', () => {
      expect(xmlFormatter.getName()).toBe('XML');
      expect(xmlFormatter.getFileExtension()).toBe('xml');
    });
    
    it('should properly escape XML special characters', () => {
      const specialCharResults: ScanResultDigest[] = [
        {
          RuleId: 'RULE-003',
          Start: { Row: 30, Column: 10, Index: 300 },
          End: { Row: 30, Column: 20, Index: 310 },
          Message: 'Test with <special> & "chars"',
          Severity: 8,
          Context: 'src/test3.js',
        },
      ];
      
      const result = xmlFormatter.format(specialCharResults, OutputFormat.Xml);
      
      expect(result).toContain('&lt;special&gt; &amp; &quot;chars&quot;');
    });
  });
  
  describe('CsvFormatter', () => {
    const csvFormatter = new CsvFormatter();
    
    it('should format ScanResultDigest array to CSV string', () => {
      const result = csvFormatter.format(mockScanResultDigests, OutputFormat.Csv);
      const lines = result.split('\n');
      
      expect(lines.length).toBe(3); // Header + 2 data rows
      expect(lines[0]).toContain('RuleId');
      expect(lines[1]).toContain('RULE-001');
      expect(lines[2]).toContain('RULE-002');
    });
    
    it('should write CSV to file when filename is provided', () => {
      csvFormatter.format(mockScanResultDigests, OutputFormat.Csv, 'output.csv');
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'output.csv',
        expect.any(String),
        'utf8'
      );
    });
    
    it('should append .csv extension if not present in filename', () => {
      csvFormatter.format(mockScanResultDigests, OutputFormat.Csv, 'output');
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'output.csv',
        expect.any(String),
        'utf8'
      );
    });
    
    it('should return correct supported output formats', () => {
      expect(csvFormatter.getSupportedOutputFormats()).toEqual([OutputFormat.Csv]);
      expect(csvFormatter.supportsOutputFormat(OutputFormat.Csv)).toBe(true);
      expect(csvFormatter.supportsOutputFormat(OutputFormat.Json)).toBe(false);
    });
    
    it('should return correct name and file extension', () => {
      expect(csvFormatter.getName()).toBe('CSV');
      expect(csvFormatter.getFileExtension()).toBe('csv');
    });
    
    it('should properly escape double quotes in CSV values', () => {
      const specialCharResults: ScanResultDigest[] = [
        {
          RuleId: 'RULE-003',
          Start: { Row: 30, Column: 10, Index: 300 },
          End: { Row: 30, Column: 20, Index: 310 },
          Message: 'Test with "quotes"',
          Severity: 8,
          Context: 'src/test3.js',
        },
      ];
      
      const result = csvFormatter.format(specialCharResults, OutputFormat.Csv);
      
      expect(result).toContain('Test with ""quotes""');
    });
    
    it('should return empty string for empty array input', () => {
      const result = csvFormatter.format([], OutputFormat.Csv);
      expect(result).toBe('');
    });
  });
  
  describe('BaseFormatter common functionality', () => {
    const jsonFormatter = new JsonFormatter();
    
    it('should create directory if it does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
      
      jsonFormatter.format(mockScanResultDigests, OutputFormat.Json, 'new/dir/output.json');
      
      expect(fs.mkdirSync).toHaveBeenCalledWith('new/dir', { recursive: true });
    });
    
    it('should throw error for invalid input type', () => {
      const invalidResults = [{ invalidProp: 'value' }] as unknown as ScanResultDigest[];
      
      expect(() => {
        jsonFormatter.format(invalidResults, OutputFormat.Json);
      }).toThrow(/only supports ScanResultDigest objects/);
    });
    
    it('should handle file writing errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (fs.writeFileSync as jest.Mock).mockImplementationOnce(() => {
        throw new Error('File write error');
      });
      
      jsonFormatter.format(mockScanResultDigests, OutputFormat.Json, 'output.json');
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error writing JSON file'));
      consoleSpy.mockRestore();
    });
  });
});