export interface Command {
	args: string[];
	env: string[];
	separator?: string;
}
