import { BaseFormatter, OutputFormat } from '../formatter.js';
import ScanResult from '../scan-result.js';
import ScanResultDigest from '../scan-result-digest.js';

export class JsonFormatter extends BaseFormatter<OutputFormat.Json> {
    format(scanResults: ScanResult[] | ScanResultDigest[], _outputFormat: OutputFormat.Json, outputFilename?: string): string {
        const digestResults = this.validateScanResultDigests(scanResults);
        const jsonContent = JSON.stringify(digestResults, null, 2);
        
        if (outputFilename) {
            this.writeToFile(jsonContent, outputFilename, this.getFileExtension());
        }
        
        return jsonContent;
    }

    supportsOutputFormat(outputFormatType: OutputFormat): boolean {
        return outputFormatType === OutputFormat.Json;
    }

    getSupportedOutputFormats(): OutputFormat[] {
        return [OutputFormat.Json];
    }

    getName(): string {
        return 'JSON';
    }
    
    getFileExtension(): string {
        return 'json';
    }
}
