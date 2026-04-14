type AnyFn = (input: any) => unknown | Promise<unknown>;

export function flow<Args = unknown, Result = unknown>(...functions: AnyFn[]) {
	return async (args: Args): Promise<Result> => {
		let result: unknown = args;

		for(const fn of functions) {
			result = await fn(result);
		}

		return result as Result;
	};
}
