import ScanResult from './scan-result.js';
import ScanResultDigest from './scan-result-digest.js';
import * as fs from 'fs';
import * as path from 'path';

export enum OutputFormat {
    Sarif,
    Csv,
    Json,
    Xml,
    Sarifv2,
}

export interface Formatter<T> {
    format(scanResults: ScanResult[] | ScanResultDigest[], outputFormat: T, outputFilename?: string): string;
    supportsOutputFormat(outputFormatType: OutputFormat): boolean;
    getSupportedOutputFormats(): OutputFormat[];
    getName(): string;
    getFileExtension(): string;
}

export abstract class BaseFormatter<T> implements Formatter<T> {
    abstract format(scanResults: ScanResult[] | ScanResultDigest[], outputFormat: T, outputFilename?: string): string;
    abstract supportsOutputFormat(outputFormatType: OutputFormat): boolean;
    abstract getSupportedOutputFormats(): OutputFormat[];
    abstract getName(): string;
    abstract getFileExtension(): string;
    
    protected writeToFile(content: string, filename: string, extension: string): void {
        try {
            // Ensure filename has the correct extension
            if (!filename.toLowerCase().endsWith(`.${extension}`)) {
                filename += `.${extension}`;
            }

            // Create directory if it doesn't exist
            const directory = path.dirname(filename);
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
            }

            fs.writeFileSync(filename, content, 'utf8');
        } catch (error) {
            console.error(`Error writing ${extension.toUpperCase()} file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    protected validateScanResultDigests(results: ScanResult[] | ScanResultDigest[]): ScanResultDigest[] {
        // Check if results are ScanResultDigest objects
        if (results.length === 0 || this.isScanResultDigest(results[0])) {
            return results as ScanResultDigest[];
        }
        
        throw new Error(`Formatter ${this.getName()} only supports ScanResultDigest objects`);
    }
    
    private isScanResultDigest(result: ScanResult | ScanResultDigest): result is ScanResultDigest {
        return 'RuleId' in result && 'Start' in result && 'End' in result;
    }
}
