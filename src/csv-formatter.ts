import { Formatter, OutputFormat } from './formatter.js';
import ScanResult, { ResultType } from './scan-result.js';

export class CSVFormatter<T> implements Formatter<T> {
    private output: string[] = [];

    getName(): string {
        return 'CSV Formatter';
    }

    getSupportedOutputFormats(): OutputFormat[] {
        return [OutputFormat.Csv];
    }

    supportsOutputFormat(outputFormatType: OutputFormat): boolean {
        return outputFormatType === OutputFormat.Csv;
    }

    format(scanResults: ScanResult[], _outputFormat: T): string {
        const csvHeaders = Object.keys(scanResults[0])
            .filter((key) => key !== 'metadata')
            .map((header) => `"${header}"`)
            .join(',');

        this.output.push(csvHeaders);

        scanResults.forEach((result) => {
            const rowValues = Object.values(result)
                .slice(1, -1) // exclude metadata and result
                .map((value) =>
                    value === ResultType.VIOLATION
                        ? 'true'
                        : value === 0 || value === null || value === undefined
                          ? ''
                          : String(value)
                )
                .join(',');

            this.output.push(`"${rowValues}"`);
        });

        return this.output.join('\n');
    }
}
