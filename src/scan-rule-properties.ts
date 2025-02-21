import { ResultType } from "./scan-result.js";

/**
 * ScanRuleConfig this interface defines the *configuration* propoerties of a scan rule.
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