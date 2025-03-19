import { BaseFormatter, OutputFormat } from '../formatter.js';
import ScanResult from '../scan-result.js';
import ScanResultDigest from '../scan-result-digest.js';

export class CsvFormatter extends BaseFormatter<OutputFormat.Csv> {
    private output: string[] = [];

    getName(): string {
        return 'CSV';
    }

    getSupportedOutputFormats(): OutputFormat[] {
        return [OutputFormat.Csv];
    }

    supportsOutputFormat(outputFormatType: OutputFormat): boolean {
        return outputFormatType === OutputFormat.Csv;
    }
    
    getFileExtension(): string {
        return 'csv';
    }

    format(scanResults: ScanResult[] | ScanResultDigest[], _outputFormat: OutputFormat.Csv, outputFilename?: string): string {
        const digestResults = this.validateScanResultDigests(scanResults);
        
        if (digestResults.length === 0) {
            return '';
        }

        this.output = [];

        // Define headers based on ScanResultDigest interface
        const headers = [
            'RuleId',
            'StartRow',
            'StartColumn',
            'StartIndex',
            'EndRow',
            'EndColumn',
            'EndIndex',
            'Message',
            'Suggestion',
            'Severity',
            'Category',
            'Context',
            'NodeText',
        ];

        this.output.push(headers.map((header) => `"${header}"`).join(','));

        // Process each digest into a CSV row
        digestResults.forEach((digest) => {
            const row = [
                `"${this.escapeCsvValue(digest.RuleId)}"`,
                digest.Start.Row,
                digest.Start.Column,
                digest.Start.Index,
                digest.End.Row,
                digest.End.Column,
                digest.End.Index,
                `"${this.escapeCsvValue(digest.Message)}"`,
                digest.Suggestion ? `"${this.escapeCsvValue(digest.Suggestion)}"` : '',
                digest.Severity,
                digest.Category ? `"${this.escapeCsvValue(digest.Category)}"` : '',
                `"${this.escapeCsvValue(digest.Context)}"`,
                digest.NodeText ? `"${this.escapeCsvValue(digest.NodeText)}"` : '',
            ];

            this.output.push(row.join(','));
        });

        const csvContent = this.output.join('\n');

        // Write to file if filename is provided
        if (outputFilename) {
            this.writeToFile(csvContent, outputFilename, this.getFileExtension());
        }

        return csvContent;
    }

    private escapeCsvValue(value: string): string {
        if (!value) return '';
        // Escape double quotes by doubling them
        return value.replace(/"/g, '""');
    }
}
