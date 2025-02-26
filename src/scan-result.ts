import Parser, { SyntaxNode } from 'tree-sitter';
import { ScanRule } from './scan-rule.js';

/**
 * Abstract class representing a generic scan metric.
 * It serves as a base for specific types of scan results or measurements,
 * encapsulating common properties and initialization logic.
 */
export abstract class ScanMetric {
    result: ResultType;
    sourceNode: SyntaxNode;
    rule: ScanRule;

    protected constructor(createdByRule: ScanRule) {
        this.result = createdByRule.ResultType;
        this.sourceNode = createdByRule.Node;
        this.rule = createdByRule;
    }
}

/**
 * Represents detailed information about a scan finding, including the rule violated,
 * the location within the source code, and any additional metadata.
 */
export default class ScanResult implements ScanMetric {
    readonly rule: ScanRule;
    readonly sourceNode: Parser.SyntaxNode;
    readonly sourceCode: string;
    readonly metadata: string[];
    readonly result: ResultType;
    /**
     * Constructs a ScanResult instance, initializing it with the provided parameters.
     * This is primarily used to capture and report details about scan findings.
     * @param rule The rule that was violated or triggered this scan result.
     * @param resultType The type of result (e.g., violation, warning).
     * @param targetNode The syntax node in the source code where the issue was found.
     * @param metadata Additional information relevant to the scan result.
     */
    constructor(rule: ScanRule, resultType?: ResultType, targetNode?: Parser.SyntaxNode, metadata?: string[]) {
        this.sourceNode = targetNode ?? rule.Node;
        this.sourceCode = rule.SourceCode;
        this.rule = rule;
        this.result = resultType ?? ResultType.VIOLATION;
        this.metadata = metadata ?? [];
    }
}

/**
 * Extends ScanMetric to represent a measurement related to a scan.
 * This could be used for metrics that are not strictly violations but still need to be tracked.
 */
export class ScanMeasure extends ScanMetric {
    MeasurementType: ResultType;
    Children: [];

    /**
     * Initializes a new instance of the ScanMeasure class.
     * @param createdByRule The scan rule that created this measure.
     */
    constructor(createdByRule: ScanRule) {
        super(createdByRule);
        this.Children = [];
        this.MeasurementType = createdByRule.ResultType;
    }
}

/**
 * Enumerates possible result types for scan operations.
 * This helps in categorizing the scan findings by their severity or nature.
 */
export enum ResultType {
    NA, // Not applicable or not classified.
    INFORMATION, // For informational purposes only, no action required.
    WARNING, // Indicates a potential issue that should be reviewed.
    VIOLATION, // Represents a definite issue that needs to be addressed.
}
