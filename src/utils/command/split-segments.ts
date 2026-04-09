export function splitSegments(s: string): string[] {
	return s.split(';').map((seg) => seg.trim()).filter(Boolean);
}
