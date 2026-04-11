export function splitPrefixAndFlags(command: string): { prefix: string; flags: string[] } {
	const tokens = command.split(/\s+/).filter(Boolean);

	let index = tokens.findIndex((t) => t.startsWith('-'));
	if(index === -1) {
		index = tokens.length;
	}

	const prefix = tokens.slice(0, index).join(' ');
	const rest = tokens.slice(index);
	const flags: string[] = [];

	for(let i = 0; i < rest.length; i++) {
		const t = rest[i];

		if(t.startsWith('-')) {
			if(i + 1 < rest.length && !rest[i + 1].startsWith('-')) {
				flags.push(`${t} ${rest[i + 1]}`);
				i++;
			}
			else {
				flags.push(t);
			}
		}
		else {
			flags.push(t);
		}
	}

	return { prefix, flags };
}
