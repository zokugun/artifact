export function getPackagePreset() {
	return {
		'map(compose)': {
			keywords: 'list(concat)',
			homepage: 'primitive',
			bugs: {
				fork: {
					object: 'map(concat)',
					default: 'primitive',
				},
			},
			license: {
				fork: {
					object: 'map(concat)',
					default: 'primitive',
				},
			},
			licenses: 'list(concat)',
			author: {
				fork: {
					object: 'map(concat)',
					default: 'primitive',
				},
			},
			repository: {
				fork: {
					object: 'map(concat)',
					default: 'primitive',
				},
			},
			scripts: {
				'map(sort)': {
					'map(compose)': {
						$$default: 'command',
					},
				},
			},
			config: {
				'map(sort)': 'map(concat)',
			},
			engines: {
				'map(sort)': 'map(concat)',
			},
			dependencies: {
				'map(sort)': 'map(concat)',
			},
			devDependencies: {
				'map(sort)': 'map(concat)',
			},
			peerDependencies: {
				'map(sort)': 'map(concat)',
			},
			optionalDependencies: {
				'map(sort)': 'map(concat)',
			},
			bundledDependencies: {
				'map(sort)': 'map(concat)',
			},

			// tools fields
			browserslist: 'list(concat)',

			// other fields
			$$ignore: [
				'name',
				'version',
				'description',
				'people',
				'man',
				'os',
				'cpu',
				'preferGlobal',
			],
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
