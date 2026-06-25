import fse from '@zokugun/fs-extra-plus/async';
import { isArray, isRecord, isString } from '@zokugun/is-it-type';
import { type AsyncDResult, type DResult, err, ok } from '@zokugun/xtry';
import yaml from 'yaml';

export type Listing = ListingEntry[];
export type ListingEntry = {
	name: string;
	description: string;
};

const CONFIG_LOCATIONS = [
	{
		name: 'artifact-listing.yml',
		type: 'yaml',
	},
	{
		name: 'artifact-listing.yaml',
		type: 'yaml',
	},
	{
		name: 'artifact-listing.json',
		type: 'json',
	},
];

export async function readListingConfig(targetPath: string): AsyncDResult<Listing> {
	let content: string | undefined;
	let name: string | undefined;
	let type: string | undefined;

	for(const place of CONFIG_LOCATIONS) {
		const result = await fse.readFile(fse.join(targetPath, place.name), 'utf8');

		if(!result.fails) {
			content = result.value;

			({ name, type } = place);
		}
	}

	if(!content) {
		return normalizeConfig(content, name!);
	}

	if(type === 'json') {
		return normalizeConfig(JSON.parse(content), name!);
	}
	else if(type === 'yaml') {
		return normalizeConfig(yaml.parse(content), name!);
	}
	else {
		try {
			return normalizeConfig(JSON.parse(content), name!);
		}
		catch {
			return normalizeConfig(yaml.parse(content), name!);
		}
	}
}

function normalizeConfig(data: unknown, source: string): DResult<Listing> { // {{{
	if(!isArray(data)) {
		return err(`Listing file ${source} must export an array.`);
	}

	for(const entry of data) {
		if(!isRecord(entry)) {
			return err('Listing entry must be an object.');
		}

		if(!isString(entry.name)) {
			return err('Listing entry/name must be a string.');
		}

		if(!isString(entry.description)) {
			return err('Listing entry/description must be a string.');
		}
	}

	return ok(data as Listing);
} // }}}
