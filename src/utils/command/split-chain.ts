export function splitChain(s: string, operator: '&&' | '||'): string[] {
	return s.split(operator).map((part) => part.trim()).filter(Boolean);
}
