/**
 * @description Interface that encapsulates the information useful when reporting on the result of a scan.
 */
export default interface ScanResultDigest{
    RuleId: string;
    Start:{
        Row: number;
        Column: number;
        Index: number;
    };
    End:{
        Row: number;
        Column: number;
        Index: number;
    };
    Message: string;
    Suggestion?: string;
    Severity: number;
    Category?: string;
    Context: string;
    NodeText?: string;
}

