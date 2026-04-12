import { type DResult, err, ok } from '@zokugun/xtry';
import untildify from 'untildify';
import { type Request } from '../types/config.js';

export function resolveRequest(spec: string): DResult<Request> { // {{{
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
			return err(`Missing variant in "${spec}"`);
		}

		return ok({ name, variant });
	}
	else {
		return ok({ name: spec });
	}
} // }}}
