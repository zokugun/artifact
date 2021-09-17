import { Context } from './context';

export type Step = (context: Context) => Promise<void>;
