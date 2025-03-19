import { BaseFormatter, OutputFormat } from '../formatter.js';
import { JSONObject } from '../json-object.js';
import ScanResult from '../scan-result.js';
import ScanResultDigest from '../scan-result-digest.js';

export class XmlFormatter extends BaseFormatter<OutputFormat.Xml> {
    format(
        scanResults: ScanResult[] | ScanResultDigest[],
        _outputFormat: OutputFormat.Xml,
        outputFilename?: string
    ): string {
        const digestResults = this.validateScanResultDigests(scanResults);
        const jsonString = JSON.stringify({ scanResults: digestResults }, null, 2);
        const xmlContent = this.jsonToXml(JSON.parse(jsonString) as JSONObject);

        if (outputFilename) {
            this.writeToFile(xmlContent, outputFilename, this.getFileExtension());
        }

        return xmlContent;
    }

    supportsOutputFormat(outputFormatType: OutputFormat): boolean {
        return outputFormatType === OutputFormat.Xml;
    }

    getSupportedOutputFormats(): OutputFormat[] {
        return [OutputFormat.Xml];
    }

    getName(): string {
        return 'XML';
    }

    getFileExtension(): string {
        return 'xml';
    }

    private jsonToXml(obj: JSONObject): string {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += this.parseObject(obj);
        return xml;
    }

    private parseObject(obj: JSONObject, indent = ''): string {
        let xml = '';
        for (const key in obj) {
            if (Array.isArray(obj[key])) {
                xml += `${indent}<${key}>\n`;
                for (const item of obj[key]) {
                    if (typeof item === 'object' && item !== null) {
                        xml += this.parseObject(item as JSONObject, indent + '  ');
                    } else {
                        xml += `${indent}  <item>${this.escapeXml(String(item))}</item>\n`;
                    }
                }
                xml += `${indent}</${key}>\n`;
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                xml += `${indent}<${key}>\n`;
                xml += this.parseObject(obj[key], indent + '  ');
                xml += `${indent}</${key}>\n`;
            } else {
                xml += `${indent}<${key}>${this.escapeXml(String(obj[key]))}</${key}>\n`;
            }
        }
        return xml;
    }

    private escapeXml(unsafe: string): string {
        return unsafe.replace(/[<>&'"]/g, (c) => {
            switch (c) {
                case '<':
                    return '&lt;';
                case '>':
                    return '&gt;';
                case '&':
                    return '&amp;';
                case "'":
                    return '&apos;';
                case '"':
                    return '&quot;';
            }
            return c;
        });
    }
}
