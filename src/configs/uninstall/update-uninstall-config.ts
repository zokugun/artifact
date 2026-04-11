import { type ArtifactResult, type InstallConfig } from '../../types/config.js';

export function updateUninstallConfig(config: InstallConfig, { name }: ArtifactResult): void {
	delete config.artifacts[name];
}
