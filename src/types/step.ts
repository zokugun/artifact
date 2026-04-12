import { type AsyncDResult } from '@zokugun/xtry';
import { type Context } from './context.js';

export type Step = (context: Context) => AsyncDResult<boolean | void>;
