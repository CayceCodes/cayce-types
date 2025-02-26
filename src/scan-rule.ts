import Parser, { QueryCapture, QueryMatch, SyntaxNode } from 'tree-sitter';
import ScanRuleProperties from './scan-rule-properties.js';
import ScanResult from './scan-result.js';
import * as TreeSitter from 'tree-sitter';

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
export function query(query: string) {
    return function (target: { prototype: ScanRuleProperties }) {
        target.prototype.Query = query;
    };
}

/**
 * Decorator for specifying a regular expression to be used in conjunction with a Tree-sitter query.
 * This allows for additional filtering or matching based on textual patterns within the nodes identified by the query.
 */
export function regex(regex: string) {
    return function (target: { prototype: ScanRuleProperties }) {
        target.prototype.RegEx = regex;
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
 * Decorator for setting the priority of a ScanRule class.
 * Priority indicates the importance or severity of the rule's findings.
 */
export function priority(priority: number) {
    return function (target: { prototype: ScanRuleProperties }) {
        target.prototype.Priority = priority;
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
export function resultType(resultType: number) {
    return function (target: { prototype: ScanRuleProperties }) {
        target.prototype.ResultType = resultType;
    };
}

/**
 * Base class for defining scan rules. Scan rules are used to identify patterns or issues in source code
 * by leveraging Tree-sitter queries and additional logic for validation and measurement.
 */
export abstract class ScanRule implements ScanRuleProperties {
    Node!: SyntaxNode;
    ResultType!: number;
    Message!: string;
    Category!: string;
    Priority!: number;
    Suggestion!: string;
    Name!: string;
    Query!: string;
    RegEx!: string;
    Context!: string;
    SourceCode!: string;

    private configuration: Map<string, string>;

    /**
     * Sets the configuration map for the rule instance.
     * Configuration can include rule-specific settings or parameters.
     */
    setConfiguration(config: Map<string, string>) {
        this.configuration = config;
    }

    /**
     * Retrieves the entire configuration map for the rule instance.
     */
    getConfiguration(): Map<string, string> {
        return this.configuration;
    }

    /**
     * Retrieves a specific configuration value by key.
     * Returns an empty string if the key does not exist.
     */
    getConfigurationValue(keyName: string): string {
        return this.configuration.get(keyName) ?? '';
    }

    /**
     * Sets a specific configuration value by key.
     */
    setConfigurationValue(keyName: string, value: string): void {
        this.configuration.set(keyName, value);
    }

    constructor() {
        this.configuration = new Map<string, string>();
    }

    /**
     * Optional method for pre-filtering nodes before further processing.
     * Can be overridden to customize the selection of nodes based on specific criteria.
     */
    preFilter(rawRoot: SyntaxNode): SyntaxNode {
        return rawRoot;
    }

    /**
     * Validates the root node after an initial query and optional pre-filtering.
     * Can be overridden to apply custom validation logic at the root level.
     */
    validateRoot(rootNode: SyntaxNode): SyntaxNode {
        return rootNode;
    }

    /**
     * Validates a collection of nodes identified by the Tree-sitter query.
     * Can be overridden to perform custom validation or analysis on each node.
     */
    validateNodes(_nodes: SyntaxNode[]): ScanResult[] {
        return [];
    }

    /**
     * Validates captures from a Tree-sitter query, allowing for targeted inspection of specific nodes.
     * Can be overridden for custom logic based on named captures within a query.
     */
    private validateCaptures(captures: QueryCapture[], targetCaptureName?: string): Parser.SyntaxNode[] {
        const results: Parser.SyntaxNode[] = [];
        captures.filter(capture => capture.name === (targetCaptureName ?? 'target'))
                .forEach(capture => results.push(capture.node));
        return results;
    }

    /**
     * Primary method for validating query matches, intended to replace individual validate methods.
     * Supports complex validation scenarios involving multiple captures and matches.
     */
    validateQuery(
        query: TreeSitter.Query,
        rootNode: Parser.SyntaxNode,
        targetCaptureName?: string,
        targetMatchIndex?: number
    ): Parser.SyntaxNode[] {
        const results: Parser.SyntaxNode[] = [];
        const matches: QueryMatch[] = query.matches(rootNode);
        if (targetMatchIndex === -1) {
            return this.validateCaptures(query.captures(rootNode), targetCaptureName);
        }
        matches.filter(match => match.pattern === targetMatchIndex)
               .flatMap(match => match.captures)
               .filter(capture => capture.name === (targetCaptureName ?? 'target'))
               .forEach(capture => results.push(capture.node));
        return results;
    }

    /**
     * Inspects a single node for compliance with the rule.
     * Can be overridden to define custom logic for evaluating individual nodes.
     */
    validateNode(_node: SyntaxNode): ScanResult[] {
        return [];
    }

    /**
     * Method for measuring aspects of the code, such as counts of specific node types.
     * Can be overridden to implement custom measurement logic.
     */
    measureNodes(_nodes: SyntaxNode[]): Map<string, SyntaxNode[]> {
        return new Map<string, SyntaxNode[]>();
    }

    /**
     * Helper method for performing counts of nodes by their type.
     * Used internally by measureNodes to aggregate node counts.
     */
    private performCount(nodes: SyntaxNode[]): Map<string, SyntaxNode[]> {
        const resultMap = new Map<string, SyntaxNode[]>();
        nodes.forEach(node => {
            const type = node.type;
            const existing = resultMap.get(type) ?? [];
            existing.push(node);
            resultMap.set(type, existing);
        });
        return resultMap;
    }
}
