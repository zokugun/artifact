import { uniq } from 'es-toolkit';
import { type Artifact, type ArtifactResult, type InstallConfig } from '../../types/config.js';

export function updateInstallConfig(config: InstallConfig, { name, version, features, provides, requires }: ArtifactResult): void {
	const artifact: Artifact = {
		version,
	};

	if(requires) {
		artifact.requires = requires;
	}

	if(provides) {
		artifact.provides = provides;
	}

	if(features) {
		artifact.features = uniq(features).sort((a, b) => a.localeCompare(b));
	}

	config.artifacts[name] = artifact;
}
