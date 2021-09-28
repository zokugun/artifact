import { Context } from './context';

export type Step = (context: Context) => Promise<boolean | void>;
