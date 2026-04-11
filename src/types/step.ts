import { type Context } from './context.js';

export type Step = (context: Context) => Promise<boolean | void>;
