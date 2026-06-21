export function buildLabel(name: string, version: string, variant: string | undefined, branch: string | undefined): string {
	let label = `${name} version=${version}`;

	if(variant) {
		label += ` variant=${variant}`;
	}

	if(branch) {
		label += ` branch=${branch}`;
	}

	return label;
}
