import { BaseFormatter, OutputFormat } from '../formatter.js';
import ScanResult from '../scan-result.js';
import ScanResultDigest from '../scan-result-digest.js';

export class SarifFormatter extends BaseFormatter<OutputFormat.Sarif | OutputFormat.Sarifv2> {
    format(
        scanResults: ScanResult[] | ScanResultDigest[], 
        _outputFormat: OutputFormat.Sarif | OutputFormat.Sarifv2,
        outputFilename?: string
    ): string {
        const digestResults = this.validateScanResultDigests(scanResults);
        
        // Convert ScanResultDigest objects to SARIF format
        const sarifObject = {
            $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
            version: '2.1.0',
            runs: [
                {
                    tool: {
                        driver: {
                            name: 'Cayce',
                            informationUri: 'https://github.com/cayce/cayce-core',
                            rules: [],
                        },
                    },
                    results: digestResults.map((digest) => ({
                        ruleId: digest.RuleId,
                        message: {
                            text: digest.Message,
                        },
                        locations: [
                            {
                                physicalLocation: {
                                    artifactLocation: {
                                        uri: digest.Context,
                                    },
                                    region: {
                                        startLine: digest.Start.Row,
                                        startColumn: digest.Start.Column,
                                        endLine: digest.End.Row,
                                        endColumn: digest.End.Column,
                                    },
                                },
                            },
                        ],
                        level: this.getSarifSeverityLevel(digest.Severity),
                        properties: {
                            category: digest.Category || 'Default',
                            suggestion: digest.Suggestion || '',
                            nodeText: digest.NodeText || '',
                        },
                    })),
                },
            ],
        };

        const sarifContent = JSON.stringify(sarifObject, null, 2);
        
        if (outputFilename) {
            this.writeToFile(sarifContent, outputFilename, this.getFileExtension());
        }
        
        return sarifContent;
    }

    supportsOutputFormat(outputFormatType: OutputFormat): boolean {
        return outputFormatType === OutputFormat.Sarif || outputFormatType === OutputFormat.Sarifv2;
    }

    getSupportedOutputFormats(): OutputFormat[] {
        return [OutputFormat.Sarif, OutputFormat.Sarifv2];
    }

    getName(): string {
        return 'SARIF';
    }
    
    getFileExtension(): string {
        return 'sarif';
    }
    
    private getSarifSeverityLevel(severity: number): string {
        // Map severity to SARIF severity levels
        if (severity >= 8) return 'error';
        if (severity >= 4) return 'warning';
        return 'note';
    }
}
