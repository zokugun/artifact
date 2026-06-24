import { uniq } from 'es-toolkit';
import { type ArtifactConfig, type ArtifactResult, type InstallConfig } from '../../types/config.js';

export function updateInstallConfig(config: InstallConfig, { name, version, features, provides, requires }: ArtifactResult): void {
	const artifact: ArtifactConfig = {
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

	const oldArtifact = config.artifacts[name];

	if(oldArtifact?.update) {
		artifact.update = oldArtifact.update;
	}

	config.artifacts[name] = artifact;
}
