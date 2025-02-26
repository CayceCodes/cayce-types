import { ResultType } from './scan-result.js';

/**
 * This interface is responsible for defining the *configuration* properties of a scan rule.
 * These properties are all exposed via ScanRule as decorators.
 */
export default interface ScanRuleProperties {
    Name: string;
    Category: string;
    Context: string;
    Message: string;
    Suggestion: string;
    Priority: number;
    Query: string;
    RegEx?: string;
    ResultType: ResultType;
}
