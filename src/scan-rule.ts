import Parser, { Language, QueryCapture, Query } from 'tree-sitter';
import { RuleSeverity } from './rule-severity.js';
import ScanRuleProperties from './scan-rule-properties.js';
import ScanResultDigest from './scan-result-digest.js';

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
 * Decorator for setting a unique identifier for a ScanRule class.
 * The ID is used to reference and manage the rule within the system.
 */
export function id(id: string) {
    return function (target: { prototype: ScanRuleProperties }) {
        target.prototype.Id = id;
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
    Id!: string;
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

    // protected constructor() {}

    /**
     * Primary method for validating query matches, intended to replace individual validate methods.
     * Supports complex validation scenarios involving multiple captures and matches.
     */
    validate(targetSource: string): ScanResultDigest[] {
        this.rawSource = targetSource;
        const parser: Parser = new Parser();
        parser.setLanguage(this.TreeSitterLanguage);
        const rootTree: Parser.Tree = parser.parse(this.rawSource);
        const queryInstance: Query = new Query(this.TreeSitterLanguage, this.TreeQuery);
        const results: ScanResultDigest[] = [];
        const captures: QueryCapture[] = queryInstance.captures(rootTree.rootNode);
        captures.forEach((capture) => {
            if (capture.name.startsWith('target')) {
                results.push(this.buildScanResult(capture.node));
            }
        });
        return results;
    }

    protected buildScanResult(node: Parser.SyntaxNode){
        const digestValue: ScanResultDigest = {
            RuleId: this.Id,
            Start: {
                Column: node.startPosition.column,
                Row: node.startPosition.row,
                Index: node.startIndex
            },
            End: {
                Column: node.endPosition.column,
                Row: node.endPosition.row,
                Index: node.endIndex
            },
            Suggestion: this.Suggestion,
            Message: this.Message,
            Category: this.Category,
            Severity: this.RuleSeverity.valueOf(),
            Context: this.Context,
            NodeText: node.text
        }
        return digestValue;
    }

    getSource(): string {
        return this.rawSource;
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    nodeHasScanDirective(baseNode: Parser.SyntaxNode, annotationName: string, argumentCount: number): boolean{
        let result: boolean = false;
        baseNode.descendantsOfType('annotation').forEach(annotationNode=>{
            if(annotationNode.text === annotationName){
                if(annotationNode.childForFieldName('annotation_argument_list')?.childCount === argumentCount){
                    return true;
                }
            }
        })
        return false;
    }
}
