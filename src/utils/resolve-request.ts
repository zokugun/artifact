import untildify from 'untildify';
import { Request } from '../types/config';

export function resolveRequest(spec: string): Request { // {{{
	if(spec.startsWith('~')) {
		spec = untildify(spec);
	}
	else if(spec.startsWith('/')) {
		// skip
	}
	else if(spec.includes('/')) {
		const [scope, name] = spec.split('/');

		if(name.startsWith('artifact-')) {
			// skip
		}
		else {
			spec = `${scope}/artifact-${name}`;
		}
	}
	else {
		if(spec.startsWith('artifact-')) {
			// skip
		}
		else {
			spec = `artifact-${spec}`;
		}
	}

	if(spec.includes(':')) {
		const [name, variant] = spec.split(':');

		if(variant.length === 0) {
			throw new Error(`Missing variant in "${spec}"`);
		}

		return { name, variant };
	}
	else {
		return { name: spec };
	}
} // }}}
