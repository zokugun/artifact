export function getDefaultSortPreset() {
	return {
		'map(sort)': {
			'map(compose)': {
				$$default: {
					fork: {
						array: 'list(concat)',
						object: {
							'map(sort)': 'map(concat)',
						},
						default: 'primitive',
					},
				},
			},
		},
	};
}
