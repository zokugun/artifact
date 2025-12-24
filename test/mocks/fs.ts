import { promisify } from 'util';
import { fs as mfs } from 'memfs';
import { fromCallback as u } from 'universalify';

const fs = {
	access: u(mfs.access),
	chmod: u(mfs.chmod),
	chown: u(mfs.chown),
	copyFile: u(mfs.copyFile),
	lstat: u(mfs.lstat),
	lstatSync: mfs.lstatSync,
	mkdir: u(mfs.mkdir),
	read: u(mfs.read),
	readdir: u(mfs.readdir),
	readdirSync: mfs.readdirSync,
	readFile: u(mfs.readFile),
	readFileSync: mfs.readFileSync,
	realpathSync: mfs.realpathSync,
	realpath: u(mfs.realpath),
	stat: u(mfs.stat),
	statSync: mfs.statSync,
	Stats: mfs.Stats,
	unlink: u(mfs.unlink),
	writeFile: u(mfs.writeFile),

	promises: {
		access: mfs.promises.access,
		chmod: mfs.promises.chmod,
		chown: mfs.promises.chown,
		copyFile: mfs.promises.copyFile,
		lstat: mfs.promises.lstat,
		mkdir: mfs.promises.mkdir,
		open: mfs.promises.open,
		read: promisify(mfs.read),
		readdir: mfs.promises.readdir,
		readFile: mfs.promises.readFile,
		realpath: mfs.promises.realpath,
		stat: mfs.promises.stat,
		Stats: mfs.Stats,
		unlink: mfs.promises.unlink,
		writeFile: mfs.promises.writeFile,
	},
};

// @ts-expect-error `fs-extra` is using `realpath.native`
fs.realpath.native = mfs.realpath;

export {
	fs,
};
