import { type Artifact, type ArtifactResult, type InstallConfig } from '../../types/config.js';

export function updateInstallConfig(config: InstallConfig, { name, version, provides, requires }: ArtifactResult): void {
	const artifact: Artifact = {
		version,
	};

	if(requires) {
		artifact.requires = requires;
	}

	if(provides) {
		artifact.provides = provides;
	}

	config.artifacts[name] = artifact;
}
