import { SyntaxNode } from 'tree-sitter';
import { ScanRule } from './scan-rule.js';

export abstract class ScanMetric {
    result: ResultType;
    sourceNode: SyntaxNode;
    rule: ScanRule;

    constructor(createdByRule: ScanRule) {
        this.result = createdByRule.ResultType;
        this.sourceNode = createdByRule.Node;
        this.rule = createdByRule;
    }
}

/**
 * @description ScanResult class is used to encapsulate various bits of information about a violation or message returned by a scan
 */
export default class ScanResult implements ScanMetric {
    readonly rule: ScanRule;
    readonly sourceNode: SyntaxNode;
    readonly sourceCode: string;
    private metadata: Array<string>;
    readonly result: ResultType;
    /**
     * constructor Doesn't do anything special other than initialize the various fields
     * @param rule
     * @param resultType
     * @param metadata
     * @see `ScanResult.metadata`
     */
    constructor(rule: ScanRule, resultType: ResultType, metadata?: Array<string>) {
        this.sourceNode = rule.Node;
        this.sourceCode = rule.SourceCode;
        this.rule = rule;
        this.metadata = metadata ?? [];
        this.result = ResultType.INFORMATION;
    }
}

export class ScanMeasure extends ScanMetric {
    MeasurementType: ResultType;
    Children: [];

    constructor(createdByRule: ScanRule) {
        super(createdByRule);
        this.Children = [];
        this.MeasurementType = createdByRule.ResultType;
    }
}

/**
 * @description This is used in conjunction with a rule's priority and facilitates filtering and different scan contextx (measure vs. scan, for example) Generally if a priority is above 2, it is considered a violation of escalating importance
 */
export enum ResultType {
    NA,
    INFORMATION,
    WARNING,
    VIOLATION,
}
