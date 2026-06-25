import { OperationMode } from '../types/context.js';

export function buildLabel(name: string, version: string, variant: string | undefined, branch: string | undefined, operationMode: OperationMode): string {
	let label = `${name} version=${version}`;

	if(variant) {
		label += ` variant=${variant}`;
	}

	if(branch) {
		label += ` branch=${branch}`;
	}

	if(operationMode === OperationMode.OnlyTouched) {
		label += ' **';
	}

	return label;
}
