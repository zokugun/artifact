import { visit, ParseErrorCode } from 'jsonc-parser';
import { type Transform } from './transform.js';

type Comment = { text: string[]; line: number };
type Value = any[] | Record<string, any>;

export function parse(text: string | undefined): { data: any; transform: Transform | undefined } {
	if(!text) {
		return {
			data: undefined,
			transform: {},
		};
	}

	const stack: Value[] = [];
	let current: Value | undefined;
	let property = '';

	const transformStack = [] as Transform[];
	let comment: Comment | undefined;
	let transform: Transform | undefined;
	let lastLine = 0;
	let lastOffset = 0;
	let lastKid: Transform | undefined;

	visit(text, {
		onObjectBegin(offset: number, length: number, startLine: number, _startCharacter: number) {
			if(current) {
				stack.unshift(current);
			}

			if(transform) {
				transformStack.unshift(transform);
			}

			current = {};
			transform = {
				children: {},
			};

			if(stack.length > 0) {
				if(Array.isArray(stack[0])) {
					stack[0].push(current);
				}
				else {
					stack[0][property] = current;
					transformStack[0].children![property] = transform;

					property = '';
				}
			}

			lastKid = transform;
			lastLine = startLine;
			lastOffset = offset + length;
		},
		onObjectProperty(name: string, _offset: number, _length: number, _startLine: number, _startCharacter: number) {
			property = name;
		},
		onObjectEnd(offset: number, length: number, startLine: number, _startCharacter: number) {
			if(stack.length > 0) {
				lastKid = transform;

				current = stack.shift();
				transform = transformStack.shift();
			}

			lastLine = startLine;
			lastOffset = offset + length;
		},
		onArrayBegin(offset: number, length: number, startLine: number, _startCharacter: number) {
			if(current) {
				stack.unshift(current);
			}

			if(transform) {
				transformStack.unshift(transform);
			}

			current = [];
			transform = {
				children: {},
			};

			if(stack.length > 0) {
				if(Array.isArray(stack[0])) {
					stack[0].push(current);
				}
				else {
					stack[0][property] = current;
					transformStack[0].children![property] = transform;

					property = '';
				}
			}

			lastKid = transform;
			lastLine = startLine;
			lastOffset = offset + length;
		},
		onArrayEnd(offset: number, length: number, startLine: number, _startCharacter: number) {
			if(stack.length > 0) {
				lastKid = transform;

				current = stack.shift();
				transform = transformStack.shift();
			}

			lastLine = startLine;
			lastOffset = offset + length;
		},
		onLiteralValue(value: unknown, offset: number, length: number, startLine: number, _startCharacter: number) {
			if(current) {
				if(Array.isArray(current)) {
					lastKid = {};
					transform!.children![current.length] = lastKid;

					current.push(value);
				}
				else {
					current[property] = value;

					if(comment) {
						transform!.children![property] = {
							comments: {
								top: comment.text,
							},
						};

						if(comment.line - lastLine > 1) {
							transform!.children![property].emptyLines = comment.line - lastLine - 1;
						}

						comment = undefined;
					}
					else if(startLine - lastLine > 1) {
						transform!.children![property] = {
							emptyLines: startLine - lastLine - 1,
						};
					}
					else {
						transform!.children![property] = {};
					}

					lastKid = transform!.children![property];

					property = '';
				}
			}

			lastLine = startLine;
			lastOffset = offset + length;
		},
		onSeparator(_character: string, offset: number, length: number, _startLine: number, _startCharacter: number) {
			lastOffset &&= offset + length;
		},
		onComment(offset: number, length: number, startLine: number, _startCharacter: number) {
			let line = text.slice(offset, offset + length);

			if(startLine === lastLine && lastKid) {
				line = text.slice(lastOffset, lastOffset + offset - lastOffset) + line;

				if(lastKid.comments) {
					lastKid.comments.right = [line];
				}
				else {
					lastKid.comments = {
						right: [line],
					};
				}
			}
			else if(comment) {
				if(comment.line + comment.text.length === startLine) {
					comment.text.push(line);
				}
				else {
					if(lastKid!.comments) {
						lastKid!.comments.bottom = comment.text;
					}
					else {
						lastKid!.comments = {
							bottom: comment.text,
						};
					}

					lastLine += comment.text.length;

					comment = {
						text: [line],
						line: startLine,
					};
				}
			}
			else {
				comment = {
					text: [line],
					line: startLine,
				};
			}
		},
		onError(error: ParseErrorCode, _offset: number, _length: number, _startLine: number, _startCharacter: number) {
			if((error === ParseErrorCode.PropertyNameExpected || error === ParseErrorCode.ValueExpected) && lastKid) {
				lastKid.separator = true;
			}
		},
	});

	return {
		data: current,
		transform,
	};
}
