import {ScanRule} from './scan-rule.js';

export interface SourceLoupePlugin {
  getRules(): ScanRule[];
}