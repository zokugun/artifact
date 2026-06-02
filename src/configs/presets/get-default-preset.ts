export function getDefaultPreset() {
	return {
		'map(compose)': {
			$$default: {
				fork: {
					array: 'list(concat)',
					object: 'map(concat)',
					default: 'primitive',
				},
			},
		},
	};
}
