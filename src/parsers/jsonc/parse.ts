import { visit, ParseErrorCode } from 'jsonc-parser';
import { Transform } from './transform';

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
			// console.log('onObjectBegin', startLine)
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
			// console.log('onObjectProperty', name, _startLine, _startCharacter)
			property = name;
		},
		onObjectEnd(offset: number, length: number, startLine: number, _startCharacter: number) {
			// console.log('onObjectEnd', startLine, startCharacter)
			if(stack.length > 0) {
				lastKid = transform;

				current = stack.shift();
				transform = transformStack.shift();
			}

			lastLine = startLine;
			lastOffset = offset + length;
		},
		onArrayBegin(offset: number, length: number, startLine: number, _startCharacter: number) {
			// console.log('onArrayBegin', startLine, _startCharacter)
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
			// console.log('onArrayEnd', startLine, _startCharacter)
			if(stack.length > 0) {
				lastKid = transform;

				current = stack.shift();
				transform = transformStack.shift();
			}

			lastLine = startLine;
			lastOffset = offset + length;
		},
		onLiteralValue(value: unknown, offset: number, length: number, startLine: number, _startCharacter: number) {
			// console.log('onLiteralValue', startLine, _startCharacter)
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
			// console.log('onSeparator', _character, _startLine, _startCharacter)
			if(lastOffset) {
				lastOffset = offset + length;
			}
		},
		onComment(offset: number, length: number, startLine: number, _startCharacter: number) {
			// console.log('onComment', startLine, _startCharacter)
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
		onError(error: number, _offset: number, _length: number, _startLine: number, _startCharacter: number) {
			// console.log('onError', error, _startLine, _startCharacter)
			if((error === ParseErrorCode.PropertyNameExpected || error === ParseErrorCode.ValueExpected) && lastKid) {
				lastKid.separator = true;
			}
		},
	});

	// console.log(JSON.stringify(transform, null, 2))

	return {
		data: current,
		transform,
	};
}
