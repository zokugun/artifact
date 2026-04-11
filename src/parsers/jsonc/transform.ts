export type Transform = {
	children?: Record<string, Transform>;
	comments?: {
		bottom?: string[];
		right?: string[];
		top?: string[];
	};
	emptyLines?: number;
	separator?: boolean;
};
