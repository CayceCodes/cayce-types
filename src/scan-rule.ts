import Parser, { Language, QueryCapture } from 'tree-sitter';
import * as TreeSitter from 'tree-sitter';
import TsSfApex from 'tree-sitter-sfapex';
import ScanResult from './scan-result.js';
import { RuleSeverity } from './rule-severity.js';
import ScanRuleProperties from './scan-rule-properties.js';

/**
 * Decorator for adding a message property to a ScanRule class.
 * The message provides context about the rule's purpose and output.
 */
export function message(message: string) {
    return function (target: { prototype: ScanRuleProperties }) {
        target.prototype.Message = message;
    };
}

/**
 * Decorator for setting a human-readable name for a ScanRule class.
 * This name gives an overview of the rule's intent.
 */
export function name(message: string) {
    return function (target: { prototype: ScanRuleProperties }) {
        target.prototype.Name = message;
    };
}

/**
 * Decorator for categorizing a ScanRule class.
 * Categories help in organizing and filtering rules based on their purpose or domain.
 */
export function category(category: string) {
    return function (target: { prototype: ScanRuleProperties }) {
        target.prototype.Category = category;
    };
}

/**
 * Decorator for defining the Tree-sitter query associated with a ScanRule class.
 * The query is used to identify the syntax nodes of interest in the source code.
 */
export function treeQuery(treeQuery: string) {
    return function (target: { prototype: ScanRuleProperties }) {
        target.prototype.TreeQuery = treeQuery;
    };
}

/**
 * Decorator for providing a suggestion on how to address or fix the issue identified by the rule.
 * Suggestions offer actionable advice to developers for resolving potential problems.
 */
export function suggestion(suggestion: string) {
    return function (target: { prototype: ScanRuleProperties }) {
        target.prototype.Suggestion = suggestion;
    };
}

/**
 * Decorator for defining the context in which a ScanRule class is applicable.
 * Context can specify whether the rule is used for scanning violations, measuring code metrics, or both.
 */
export function context(context: string) {
    return function (target: { prototype: ScanRuleProperties }) {
        target.prototype.Context = context;
    };
}

/**
 * Decorator for assigning a result type to a ScanRule class.
 * Result types categorize the outcomes of applying the rule, such as violations or informational findings.
 */
export function ruleSeverity(ruleSeverity: RuleSeverity) {
    return function (target: { prototype: ScanRuleProperties }) {
        target.prototype.RuleSeverity = ruleSeverity;
    };
}

/**
 * Base class for defining scan rules. Scan rules are used to identify patterns or issues in source code
 * by leveraging Tree-sitter queries and additional logic for validation and measurement.
 */
export abstract class ScanRule implements ScanRuleProperties {
    RuleSeverity!: number;
    Message!: string;
    Category!: string;
    Priority!: number;
    Suggestion!: string;
    Name!: string;
    TreeQuery!: string;
    Context!: string;
    TreeSitterLanguage!: Language;

    protected rawSource!: string;

    constructor() {}

    /**
     * Primary method for validating query matches, intended to replace individual validate methods.
     * Supports complex validation scenarios involving multiple captures and matches.
     */
    validate(targetSource: string, parser: Parser): Parser.SyntaxNode[] {
        this.rawSource = targetSource;
        parser.setLanguage(this.TreeSitterLanguage);
        const rootTree: Parser.Tree = parser.parse(this.rawSource);
        const queryInstance: TreeSitter.Query = new TreeSitter.Query(this.TreeSitterLanguage, this.TreeQuery);
        const results: Parser.SyntaxNode[] = [];
        const captures: QueryCapture[] = queryInstance.captures(rootTree.rootNode);
        captures.forEach((capture) => {
            results.push(capture.node);
        });
        return results;
    }

    filterResults(results: ScanResult[]): ScanResult[] {
        return results;
    }

    getSource(): string {
        return this.rawSource;
    }
}
